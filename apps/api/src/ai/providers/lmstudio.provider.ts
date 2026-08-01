import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  AiChatMessage,
  AiResponse,
  AiResponseMetadata,
  AiToolCall,
  IAiProvider,
} from '../interfaces/ai-provider.interface';
import { getSystemPrompt } from '../prompts/crud-system.prompt';
import { AiToolHandlerService } from '../ai-tool-handler.service';
import { MessageRole } from '../../constants/enums';
import { AI_TOOLS } from '../ai-tools.definitions';

interface OpenAiChatCompletionResponse {
  choices: {
    message: {
      content: string | null;
      tool_calls?: AiToolCall[];
    };
  }[];
}

interface StreamChunk {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
}

interface ParsedResponse {
  message: string;
  metadata?: AiResponseMetadata;
}

@Injectable()
export class LMStudioProvider implements IAiProvider {
  private readonly logger = new Logger(LMStudioProvider.name);
  private readonly baseUrl: string;
  private readonly modelName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly toolHandler: AiToolHandlerService,
  ) {
    this.baseUrl =
      this.configService.get<string>('LMSTUDIO_BASE_URL') ||
      'http://localhost:1234/v1';
    this.modelName =
      this.configService.get<string>('LMSTUDIO_MODEL') || 'local-model';
  }

  private formatMessages(
    history: AiChatMessage[],
    systemPromptOverride?: string,
  ) {
    const formattedHistory = history.map((msg) => ({
      role: String(msg.role).toLowerCase() as
        | 'user'
        | 'assistant'
        | 'system'
        | 'tool',
      content: msg.content ?? '',
      ...(msg.tool_call_id ? { tool_call_id: msg.tool_call_id } : {}),
      ...(msg.tool_calls ? { tool_calls: msg.tool_calls } : {}),
    }));

    const systemContent = systemPromptOverride || getSystemPrompt();

    return [{ role: 'system', content: systemContent }, ...formattedHistory];
  }

  private parseJsonResponse(rawText: string): AiResponse {
    const sanitized = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    try {
      const parsed = JSON.parse(sanitized) as ParsedResponse;

      if (parsed && typeof parsed === 'object' && parsed.message) {
        return {
          message: parsed.message,
          metadata: parsed.metadata || { type: 'text' },
        };
      }
    } catch {
      // Fallback if parsing fails
    }

    return {
      message: sanitized,
      metadata: { type: 'text' },
    };
  }

  private readonly responseFormatSchema = {
    type: 'json_schema',
    json_schema: {
      name: 'ai_response_schema',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          metadata: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['proposal', 'text'] },
              proposal: {
                type: ['object', 'null'],
                properties: {
                  entity: { type: 'string' },
                  action: {
                    type: 'string',
                    enum: ['create', 'update', 'delete'],
                  },
                  status: { type: 'string' },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      additionalProperties: true,
                    },
                  },
                },
                required: ['entity', 'action', 'status', 'data'],
                additionalProperties: false,
              },
            },
            required: ['type', 'proposal'],
            additionalProperties: false,
          },
        },
        required: ['message', 'metadata'],
        additionalProperties: false,
      },
    },
  };

  async generateResponse(
    history: AiChatMessage[],
    systemPrompt?: string,
    hasExecutedTools = false,
  ): Promise<AiResponse> {
    const messages = this.formatMessages(history, systemPrompt);

    try {
      const payload: Record<string, any> = {
        model: this.modelName,
        messages,
        temperature: 0.1,
      };

      if (!hasExecutedTools) {
        payload.tools = AI_TOOLS;
        payload.tool_choice = 'auto';
      } else {
        payload.response_format = this.responseFormatSchema;
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `LM Studio API Error (${response.status}): ${errorText}`,
        );
        throw new Error(`LM Studio HTTP Error: ${response.status}`);
      }

      const data = (await response.json()) as OpenAiChatCompletionResponse;
      const choice = data.choices?.[0]?.message;

      if (choice?.tool_calls && choice.tool_calls.length > 0) {
        this.logger.debug(
          `Executing ${choice.tool_calls.length} tool calls...`,
        );

        history.push({
          role: MessageRole.ASSISTANT,
          content: choice.content || '',
          tool_calls: choice.tool_calls,
        });

        for (const toolCall of choice.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments || '{}') as {
            query: string;
          };

          const result = await this.toolHandler.handleToolCall(
            toolName,
            toolArgs,
          );

          history.push({
            role: MessageRole.TOOL,
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        }

        return this.generateResponse(history, systemPrompt, true);
      }

      if (!choice?.content) {
        throw new Error('Empty response received from LM Studio provider');
      }

      return this.parseJsonResponse(choice.content);
    } catch (error: unknown) {
      this.logger.error(
        'Failed to generate AI response via LM Studio',
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'LM Studio provider failed to generate a response.',
      );
    }
  }

  async *generateResponseStream(
    history: AiChatMessage[],
    systemPrompt?: string,
  ): AsyncIterable<string> {
    const messages = this.formatMessages(history, systemPrompt);

    let preCheckResponse: Response;
    try {
      preCheckResponse = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          tools: AI_TOOLS,
          temperature: 0.1,
          stream: false,
        }),
      });
    } catch (error) {
      this.logger.error('Failed to communicate with LM Studio', error);
      throw new InternalServerErrorException('LM Studio connection failed');
    }

    if (preCheckResponse.ok) {
      const data =
        (await preCheckResponse.json()) as OpenAiChatCompletionResponse;
      const choice = data.choices?.[0]?.message;

      if (choice?.tool_calls && choice.tool_calls.length > 0) {
        this.logger.debug(
          `[Stream] Tool call detected. Executing ${choice.tool_calls.length} tools first.`,
        );

        history.push({
          role: MessageRole.ASSISTANT,
          content: choice.content || '',
          tool_calls: choice.tool_calls,
        });

        for (const toolCall of choice.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments || '{}') as {
            query: string;
          };

          const result = await this.toolHandler.handleToolCall(
            toolName,
            toolArgs,
          );

          history.push({
            role: MessageRole.TOOL,
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        }

        yield* this.generateResponseStream(history, systemPrompt);
        return;
      }
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          messages: this.formatMessages(history, systemPrompt),
          temperature: 0.1,
          stream: true,
          response_format: this.responseFormatSchema,
        }),
      });
    } catch (error) {
      this.logger.error('Failed to initiate stream with LM Studio', error);
      throw new InternalServerErrorException('LM Studio connection failed');
    }

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      this.logger.error(
        `LM Studio Stream Error (${response.status}): ${errorText}`,
      );
      throw new InternalServerErrorException('LM Studio streaming error');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') return;

          try {
            const parsed = JSON.parse(dataStr) as StreamChunk;
            const token = parsed.choices?.[0]?.delta?.content;
            if (token) {
              yield token;
            }
          } catch {
            // Ignore partial buffer chunks
          }
        }
      }
    }
  }
}
