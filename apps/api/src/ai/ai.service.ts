import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  AiResponse,
  AiChatMessage,
  AI_PROVIDER_STRATEGY,
} from './interfaces/ai-provider.interface';
import { PrismaService } from '../prisma/prisma.service';
import { SYSTEM_PROMPT } from './prompts/crud-system.prompt';
import type { IAiProvider } from './interfaces/ai-provider.interface';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @Inject(AI_PROVIDER_STRATEGY)
    private readonly aiProvider: IAiProvider,
    private prisma: PrismaService,
  ) {}

  private async buildSystemPromptWithDbContext(): Promise<string> {
    try {
      const [categories, subCategories, colors, sizes] = await Promise.all([
        this.prisma.category.findMany({ select: { id: true, name: true } }),
        this.prisma.subCategory.findMany({
          select: { id: true, name: true, categoryId: true },
        }),
        this.prisma.color.findMany({
          select: { id: true, name: true, hex: true },
        }),
        this.prisma.size.findMany({ select: { id: true, name: true } }),
      ]);

      console.log({ categories, subCategories, colors, sizes });

      const dbContext = `
<SYSTEM_CONTEXT>
AVAILABLE DATABASE ENTITIES (Use these real IDs when assigning foreign key references):
- Categories: ${JSON.stringify(categories)}
- SubCategories: ${JSON.stringify(subCategories)}
- Colors: ${JSON.stringify(colors)}
- Sizes: ${JSON.stringify(sizes)}
</SYSTEM_CONTEXT>
      `.trim();

      return `${SYSTEM_PROMPT}\n\n${dbContext}`;
    } catch (error) {
      this.logger.error(
        'Failed to fetch Prisma DB context for AI prompt',
        error,
      );
      return SYSTEM_PROMPT;
    }
  }

  async generateResponse(history: AiChatMessage[]): Promise<AiResponse> {
    this.logger.debug(
      `Fetching DB context & delegating batch generation request with ${history.length} messages.`,
    );

    const systemPrompt = await this.buildSystemPromptWithDbContext();
    return this.aiProvider.generateResponse(history, systemPrompt);
  }

  async *generateResponseStream(
    history: AiChatMessage[],
  ): AsyncIterable<string> {
    this.logger.debug(
      `Fetching DB context & delegating stream request with ${history.length} messages.`,
    );

    const systemPrompt = await this.buildSystemPromptWithDbContext();
    yield* this.aiProvider.generateResponseStream(history, systemPrompt);
  }
}
