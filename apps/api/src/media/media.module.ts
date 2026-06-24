import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaProvider } from './media.provider';
import { MediaController } from './media.controller';

@Module({
  controllers: [MediaController],
  providers: [MediaService, MediaProvider],
})
export class MediaModule {}
