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

interface ParsedResponse {
  message: string;
  metadata?: AiResponseMetadata;
}

@Injectable()
export class LMStudioProvider implements IAiProvider {
  private readonly logger = new Logger(LMStudioProvider.name);
  private readonly baseUrl: string;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('LMSTUDIO_BASE_URL') ||
      'http://localhost:1234/v1';
    this.modelName =
      this.configService.get<string>('LMSTUDIO_MODEL') || 'local-model';

    console.log({ url: this.configService.get<string>('LMSTUDIO_BASE_URL') });
  }

  async generateResponse(history: AiChatMessage[]): Promise<AiResponse> {
    const messages = [
      { role: 'system', content: getSystemPrompt() },
      ...history,
    ];

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `LM Studio API Error (${response.status}): ${errorText}`,
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

  private parseJsonResponse(rawText: string): AiResponse {
    try {
      // Clean potential markdown backticks that local models sometimes produce
      const sanitized = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

      const parsed = JSON.parse(sanitized) as ParsedResponse;

      if (!parsed.message) {
        throw new Error('Parsed response missing required "message" property');
      }

      return {
        message: parsed.message,
        metadata: parsed.metadata || { type: 'text' },
      };
    } catch {
      this.logger.warn(
        `Failed to parse raw JSON from LM Studio. Raw content: "${rawText}"`,
      );
      return {
        message: rawText,
        metadata: { type: 'text' },
      };
    }
  }
}
