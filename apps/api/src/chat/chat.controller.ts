import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Res,
  Query,
} from '@nestjs/common';
import type { Response } from 'express';

import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import type { AuthUser } from '../auth/auth.interface';
import { SendMessageDto } from './dto/send-message.dto';
import { AuthCtx } from '../user/decorators/user.decorator';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  createConversation(
    @AuthCtx() user: AuthUser,
    @Body() dto: CreateChatDto,
    @Res() res: Response,
  ) {
    if (dto.initialMessage) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();
    }
    return this.chatService.createConversation(user.id, dto, res);
  }

  @Get()
  getConversations(
    @AuthCtx() user: AuthUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.chatService.getConversations(user.id, query);
  }

  @Post(':id/messages')
  async sendMessage(
    @AuthCtx() user: AuthUser,
    @Param('id') chatId: string,
    @Body() dto: SendMessageDto,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    await this.chatService.sendMessageStream(user.id, chatId, dto, res);
  }

  @Get(':id')
  getConversation(@AuthCtx() user: AuthUser, @Param('id') id: string) {
    return this.chatService.getConversation(user.id, id);
  }

  @Delete(':id')
  deleteConversation(
    @AuthCtx() user: AuthUser,

    @Param('id') id: string,
  ) {
    return this.chatService.deleteConversation(user.id, id);
  }
}
