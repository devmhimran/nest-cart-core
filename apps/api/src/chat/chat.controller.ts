import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import type { AuthUser } from '../auth/auth.interface';
import { AuthCtx } from '../user/decorators/user.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  createConversation(@AuthCtx() user: AuthUser, @Body() dto: CreateChatDto) {
    return this.chatService.createConversation(user.id, dto);
  }

  @Get()
  getConversations(@AuthCtx() user: AuthUser) {
    return this.chatService.getConversations(user.id);
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
