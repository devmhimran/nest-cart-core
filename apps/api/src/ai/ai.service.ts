import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  AiResponse,
  AiChatMessage,
  AI_PROVIDER_STRATEGY,
} from './interfaces/ai-provider.interface';
import type { IAiProvider } from './interfaces/ai-provider.interface';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @Inject(AI_PROVIDER_STRATEGY)
    private readonly aiProvider: IAiProvider,
  ) {}

  async generateResponse(history: AiChatMessage[]): Promise<AiResponse> {
    this.logger.debug(
      `Delegating batch generation request with ${history.length} messages to active AI provider strategy.`,
    );

    return this.aiProvider.generateResponse(history);
  }

  async *generateResponseStream(
    history: AiChatMessage[],
  ): AsyncIterable<string> {
    this.logger.debug(
      `Delegating stream request with ${history.length} messages to active AI provider strategy.`,
    );

    yield* this.aiProvider.generateResponseStream(history);
  }
}
