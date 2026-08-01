import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  AiResponse,
  AiChatMessage,
  AI_PROVIDER_STRATEGY,
} from './interfaces/ai-provider.interface';
import { SYSTEM_PROMPT } from './prompts/crud-system.prompt';
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
      `Delegating batch generation request with ${history.length} messages.`,
    );

    return this.aiProvider.generateResponse(history, SYSTEM_PROMPT);
  }

  async *generateResponseStream(
    history: AiChatMessage[],
  ): AsyncIterable<string> {
    this.logger.debug(
      `Delegating stream request with ${history.length} messages.`,
    );

    yield* this.aiProvider.generateResponseStream(history, SYSTEM_PROMPT);
  }
}
