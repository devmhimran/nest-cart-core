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
} from '@google/generative-ai';
import {
  AiChatMessage,
  AiResponse,
  AiResponseMetadata,
  IAiProvider,
} from '../interfaces/ai-provider.interface';
import { getSystemPrompt } from '../prompts/crud-system.prompt';

interface ParsedResponse {
  message: string;
  metadata?: AiResponseMetadata;
}

@Injectable()
export class GeminiProvider implements IAiProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly aiClient: GoogleGenerativeAI;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not defined in configuration');
    }
    this.aiClient = new GoogleGenerativeAI(apiKey ?? '');
    this.modelName =
      this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';
  }

  async generateResponse(history: AiChatMessage[]): Promise<AiResponse> {
    try {
      const model = this.aiClient.getGenerativeModel({
        model: this.modelName,
        systemInstruction: getSystemPrompt(),
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const formattedContents: Content[] =
        this.mapHistoryToGeminiContents(history);

      const result: GenerateContentResult = await model.generateContent({
        contents: formattedContents,
      });

      const rawText = result.response.text();

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

  /**
   * Converts generic AiChatMessage[] to Gemini's expected Content[] structure.
   * Merges consecutive system or user roles as required by Gemini syntax rules.
   */
  private mapHistoryToGeminiContents(history: AiChatMessage[]): Content[] {
    return history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
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

      return {
        message: parsed.message,
        metadata: parsed.metadata || { type: 'text' },
      };
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
}
