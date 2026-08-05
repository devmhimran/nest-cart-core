import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  AiResponse,
  AiChatMessage,
  AI_PROVIDER_STRATEGY,
} from './interfaces/ai-provider.interface';
import { getSystemPrompt, SYSTEM_PROMPT } from './prompts/crud-system.prompt';
import type { IAiProvider } from './interfaces/ai-provider.interface';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @Inject(AI_PROVIDER_STRATEGY)
    private readonly aiProvider: IAiProvider,
  ) {}

  private prepareHistory(history: AiChatMessage[]): AiChatMessage[] {
    const cleanHistory = history.filter(
      (msg) => String(msg.role).toLowerCase() !== 'system',
    );
    return cleanHistory;
  }

  async generateResponse(history: AiChatMessage[]): Promise<AiResponse> {
    this.logger.debug(
      `Delegating batch generation request with ${history.length} messages.`,
    );

    return this.aiProvider.generateResponse(history, SYSTEM_PROMPT);
  }

  async *generateResponseStream(
    history: AiChatMessage[],
  ): AsyncIterable<string> {
    const cleanedHistory = this.prepareHistory(history);
    const originalLength = cleanedHistory.length;

    this.logger.debug(
      `Delegating stream request with ${cleanedHistory.length} messages.`,
    );

    const systemPrompt = getSystemPrompt();
    yield* this.aiProvider.generateResponseStream(cleanedHistory, systemPrompt);

    const appended = cleanedHistory.slice(originalLength);
    if (appended.length > 0) {
      history.push(...appended);
    }
  }
}
