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
  IAiProvider,
} from '../interfaces/ai-provider.interface';
import { getSystemPrompt } from '../prompts/crud-system.prompt';

interface OpenAiChatCompletionResponse {
  choices: {
    message: {
      content: string;
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

  private formatMessages(
    history: AiChatMessage[],
    systemPromptOverride?: string,
  ) {
    const formattedHistory = history.map((msg) => ({
      role: String(msg.role).toLowerCase() as 'user' | 'assistant' | 'system',
      content: msg.content,
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
      // If the local model still outputs raw string text instead of JSON,
      // silently wrap it into Format B so your frontend doesn't break.
    }

    return {
      message: sanitized,
      metadata: { type: 'text' },
    };
  }

  constructor(private readonly configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('LMSTUDIO_BASE_URL') ||
      'http://localhost:1234/v1';
    this.modelName =
      this.configService.get<string>('LMSTUDIO_MODEL') || 'local-model';
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
  ): Promise<AiResponse> {
    const messages = this.formatMessages(history, systemPrompt);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          temperature: 0.1,
          response_format: this.responseFormatSchema,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `LM Studio API Error (${response.status}):${errorText}`,
        );
        throw new Error(`LM Studio HTTP Error: ${response.status}`);
      }

      const data = (await response.json()) as OpenAiChatCompletionResponse;
      const rawContent = data.choices?.[0]?.message?.content;

      if (!rawContent) {
        throw new Error('Empty response received from LM Studio provider');
      }

      return this.parseJsonResponse(rawContent);
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

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          temperature: 0.1,
          stream: true,
          response_format: this.responseFormatSchema, // FIXED: Added schema constraint to streaming!
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
            // Ignore incomplete chunks in buffer
          }
        }
      }
    }
  }
}
