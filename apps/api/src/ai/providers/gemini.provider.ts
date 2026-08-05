import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenerativeAI,
  Content,
  GenerateContentResult,
  FunctionDeclaration,
  Tool,
} from '@google/generative-ai';

import {
  AiChatMessage,
  AiResponse,
  AiResponseMetadata,
  IAiProvider,
} from '../interfaces/ai-provider.interface';
import { MessageRole } from '../../constants/enums';
import { getSystemPrompt } from '../prompts/crud-system.prompt';
import { AI_TOOLS } from '../ai-tools.definitions';
import { AiToolHandlerService } from '../ai-tool-handler.service';

interface ParsedResponse {
  message: string;
  metadata?: AiResponseMetadata;
}

@Injectable()
export class GeminiProvider implements IAiProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly aiClient: GoogleGenerativeAI;
  private readonly modelName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly toolHandler: AiToolHandlerService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not defined in configuration');
    }
    this.aiClient = new GoogleGenerativeAI(apiKey ?? '');
    this.modelName =
      this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
  }

  private getGeminiTools(): Tool[] {
    const functionDeclarations: FunctionDeclaration[] = AI_TOOLS.map(
      (tool) => ({
        name: tool.function.name,
        description: tool.function.description,
        parameters: tool.function.parameters as any,
      }),
    );
    return [{ functionDeclarations }];
  }

  async generateResponse(
    history: AiChatMessage[],
    systemPrompt?: string,
    hasExecutedTools = false,
  ): Promise<AiResponse> {
    try {
      const modelConfig: any = {
        model: this.modelName,
        systemInstruction: systemPrompt || getSystemPrompt(),
        generationConfig: {
          temperature: 0.2,
        },
      };

      if (hasExecutedTools) {
        modelConfig.generationConfig.responseMimeType = 'application/json';
      } else {
        modelConfig.tools = this.getGeminiTools();
      }

      const model = this.aiClient.getGenerativeModel(modelConfig);

      const formattedContents: Content[] =
        this.mapHistoryToGeminiContents(history);

      const result: GenerateContentResult = await model.generateContent({
        contents: formattedContents,
      });

      const response = result.response;

      const functionCalls = response.functionCalls();
      if (functionCalls && functionCalls.length > 0) {
        this.logger.debug(
          `Executing ${functionCalls.length} tool calls from Gemini...`,
        );

        history.push({
          role: MessageRole.ASSISTANT,
          content: '',
          tool_calls: functionCalls.map((fc) => ({
            id: fc.name,
            type: 'function' as const,
            function: {
              name: fc.name,
              arguments: JSON.stringify(fc.args),
            },
          })),
        });

        for (const functionCall of functionCalls) {
          const toolName = functionCall.name;
          const toolArgs = functionCall.args as { query?: string };

          this.logger.debug(
            `[Gemini] Tool: ${toolName}, args: ${JSON.stringify(toolArgs)}`,
          );

          const toolResult = await this.toolHandler.handleToolCall(
            toolName,
            toolArgs,
          );

          this.logger.debug(
            `[Gemini] Result: ${JSON.stringify(toolResult).substring(0, 500)}`,
          );

          history.push({
            role: MessageRole.TOOL,
            tool_call_id: toolName,
            content: JSON.stringify(toolResult),
          });
        }

        return this.generateResponse(history, systemPrompt, true);
      }

      const rawText = response.text();

      if (!rawText) {
        throw new Error('Empty response content received from Gemini model');
      }

      return this.parseJsonResponse(rawText);
    } catch (error) {
      this.logger.error(
        'Failed to generate AI response via Gemini Provider',
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Gemini provider failed to generate a response.',
      );
    }
  }

  async *generateResponseStream(
    history: AiChatMessage[],
    systemPrompt?: string,
  ): AsyncIterable<string> {
    try {
      const model = this.aiClient.getGenerativeModel({
        model: this.modelName,
        systemInstruction: systemPrompt || getSystemPrompt(),
        generationConfig: {
          temperature: 0.2,
        },
        tools: this.getGeminiTools(),
      });

      const formattedContents: Content[] =
        this.mapHistoryToGeminiContents(history);

      const result = await model.generateContent({
        contents: formattedContents,
      });

      const functionCalls = result.response.functionCalls();
      if (functionCalls && functionCalls.length > 0) {
        this.logger.debug(
          `[Stream] Executing ${functionCalls.length} tool calls from Gemini...`,
        );

        history.push({
          role: MessageRole.ASSISTANT,
          content: '',
          tool_calls: functionCalls.map((fc) => ({
            id: fc.name,
            type: 'function' as const,
            function: {
              name: fc.name,
              arguments: JSON.stringify(fc.args),
            },
          })),
        });

        for (const functionCall of functionCalls) {
          const toolName = functionCall.name;
          const toolArgs = functionCall.args as { query?: string };

          this.logger.debug(
            `[Stream] Tool: ${toolName}, args: ${JSON.stringify(toolArgs)}`,
          );

          const toolResult = await this.toolHandler.handleToolCall(
            toolName,
            toolArgs,
          );

          this.logger.debug(
            `[Stream] Result: ${JSON.stringify(toolResult).substring(0, 500)}`,
          );

          history.push({
            role: MessageRole.TOOL,
            tool_call_id: toolName,
            content: JSON.stringify(toolResult),
          });
        }

        yield* this.generateResponseStream(history, systemPrompt);
        return;
      }

      const rawText = result.response.text();
      if (rawText) {
        yield rawText;
      }
    } catch (error) {
      this.logger.error(
        'Failed to stream AI response via Gemini Provider',
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Gemini provider streaming failed.',
      );
    }
  }

  private mapHistoryToGeminiContents(history: AiChatMessage[]): Content[] {
    const contents: Content[] = [];

    for (const msg of history) {
      if (msg.role === MessageRole.TOOL) {
        contents.push({
          role: 'function',
          parts: [
            {
              functionResponse: {
                name: msg.tool_call_id || 'unknown',
                response: JSON.parse(msg.content),
              },
            },
          ],
        });
      } else if (msg.role === MessageRole.ASSISTANT && msg.tool_calls) {
        const functionCalls = msg.tool_calls.map((tc) => ({
          name: tc.function.name,
          args: JSON.parse(tc.function.arguments),
        }));
        contents.push({
          role: 'model',
          parts: functionCalls.map((fc) => ({ functionCall: fc })),
        });
      } else {
        contents.push({
          role: msg.role === MessageRole.ASSISTANT ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }

    return contents;
  }

  private parseJsonResponse(rawText: string): AiResponse {
    try {
      const sanitized = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

      const parsed = JSON.parse(sanitized) as ParsedResponse;

      if (!parsed.message) {
        throw new Error('Parsed response missing required "message" property');
      }

      const response: AiResponse = {
        message: parsed.message,
        metadata: parsed.metadata || { type: 'text' },
      };

      return this.fixProposalResponse(response);
    } catch {
      this.logger.warn(
        `Failed to parse raw JSON from Gemini. Raw content: "${rawText}"`,
      );
      return {
        message: rawText,
        metadata: { type: 'text' },
      };
    }
  }

  private fixProposalResponse(response: AiResponse): AiResponse {
    if (response.metadata?.type !== 'proposal' || !response.metadata?.proposal) {
      return response;
    }

    const proposal = response.metadata.proposal;
    const originalMessage = response.message;

    const forbiddenWords = ['successful', 'completed', 'done', 'executed', 'finished'];
    const hasForbiddenWord = forbiddenWords.some(word => 
      originalMessage.toLowerCase().includes(word)
    );

    if (hasForbiddenWord) {
      const action = proposal.action;
      const entity = proposal.entity;
      const data = Array.isArray(proposal.data) ? proposal.data[0] : proposal.data;
      const name = data?.name || data?.title || data?.code || data?.slug || 'item';

      let newMessage: string;
      switch (action) {
        case 'update':
          newMessage = `Proposed to update ${entity} '${name}'. Pending approval.`;
          break;
        case 'delete':
          newMessage = `Proposed to delete ${entity} '${name}'. Pending approval.`;
          break;
        case 'create':
          newMessage = `Proposed to create ${entity} '${name}'. Pending approval.`;
          break;
        default:
          newMessage = `Proposed ${action} on ${entity}. Pending approval.`;
      }

      this.logger.warn(
        `Fixed proposal message: "${originalMessage}" → "${newMessage}"`,
      );
      response.message = newMessage;
    }

    return response;
  }
}
