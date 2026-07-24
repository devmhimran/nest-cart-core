import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  AI_PROVIDER_STRATEGY,
  AiChatMessage,
  AiResponse,
} from './interfaces/ai-provider.interface';

import type { IAiProvider } from './interfaces/ai-provider.interface';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @Inject(AI_PROVIDER_STRATEGY)
    private readonly aiProvider: IAiProvider,
  ) {}

  /**
   * Delegates completion generation to the injected AI strategy.
   * ChatService calls this method without knowing whether LM Studio or Gemini is active.
   */
  async generateResponse(history: AiChatMessage[]): Promise<AiResponse> {
    this.logger.debug(
      `Delegating generation request with ${history.length} messages to active AI provider strategy.`,
    );

    return this.aiProvider.generateResponse(history);
  }
}
