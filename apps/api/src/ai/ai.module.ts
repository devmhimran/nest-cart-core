import { Module, Provider, BadRequestException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { LMStudioProvider } from './providers/lmstudio.provider';
import { GeminiProvider } from './providers/gemini.provider';
import {
  AI_PROVIDER_STRATEGY,
  IAiProvider,
} from './interfaces/ai-provider.interface';

const AiProviderStrategyFactory: Provider = {
  provide: AI_PROVIDER_STRATEGY,
  useFactory: (
    configService: ConfigService,
    lmStudioProvider: LMStudioProvider,
    geminiProvider: GeminiProvider,
  ): IAiProvider => {
    const providerName = configService
      .get<string>('AI_PROVIDER', 'lmstudio')
      .toLowerCase()
      .trim();

    switch (providerName) {
      case 'lmstudio':
        return lmStudioProvider;
      case 'gemini':
        return geminiProvider;
      default:
        throw new BadRequestException(
          `Unsupported AI_PROVIDER configured: "${providerName}". Expected "lmstudio" or "gemini".`,
        );
    }
  },
  inject: [ConfigService, LMStudioProvider, GeminiProvider],
};

@Module({
  imports: [ConfigModule],
  providers: [
    LMStudioProvider,
    GeminiProvider,
    AiProviderStrategyFactory,
    AiService,
  ],
  exports: [AiService],
})
export class AiModule {}
