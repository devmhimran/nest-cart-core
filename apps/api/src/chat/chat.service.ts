import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';

import { Prisma } from '../../generated/prisma/client';
import { MessageRole, MessageStatus } from '../constants/enums';
import {
  AiChatMessage,
  AiResponse,
  AiResponseMetadata,
} from '../ai/interfaces/ai-provider.interface';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Initializes a new chat session for an authenticated user.
   * Optionally persists an initial message and triggers the AI response flow.
   */
  async createConversation(userId: string, dto: CreateChatDto) {
    const session = await this.prisma.chatSession.create({
      data: {
        userId,
        title: dto.title ?? 'New Chat',
        lastMessageAt: new Date(),
      },
    });

    if (dto.initialMessage) {
      return this.sendMessage(userId, session.id, {
        content: dto.initialMessage,
      });
    }

    return session;
  }

  /**
   * Retrieves all chat sessions for a specific user, sorted by last active time.
   */
  async getConversations(userId: string) {
    return this.prisma.chatSession.findMany({
      where: { userId },
      orderBy: { lastMessageAt: 'desc' },
      select: {
        id: true,
        title: true,
        lastMessageAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  /**
   * Retrieves a single chat session with ordered message history.
   */
  async getConversation(userId: string, chatId: string) {
    const conversation = await this.prisma.chatSession.findFirst({
      where: { id: chatId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  /**
   * Main messaging flow:
   * 1. Validates ownership
   * 2. Persists User message
   * 3. Fetches history & converts to AiChatMessage[]
   * 4. Sends history to AiService
   * 5. Persists Assistant response
   * 6. Updates session timestamp & auto-titles initial chats
   */
  async sendMessage(userId: string, chatId: string, dto: SendMessageDto) {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: chatId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Conversation not found');
    }

    // 1. Save User Message
    const userMessage = await this.prisma.chatMessage.create({
      data: {
        chatSessionId: chatId,
        role: MessageRole.USER,
        content: dto.content,
        status: MessageStatus.COMPLETED,
      },
    });

    // 2. Map existing DB history to generic AI provider format
    const history: AiChatMessage[] = session.messages.map((msg) => ({
      role: msg.role === 'USER' ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Append current user query to execution history
    history.push({ role: 'user', content: dto.content });

    // 3. Delegate to provider-agnostic AiService
    let aiResponse: AiResponse;
    try {
      aiResponse = await this.aiService.generateResponse(history);
    } catch {
      // Save failed assistant message marker for continuity
      await this.prisma.chatMessage.create({
        data: {
          chatSessionId: chatId,
          role: MessageRole.ASSISTANT,
          content: 'An error occurred while generating a response.',
          status: MessageStatus.FAILED,
        },
      });
      throw new InternalServerErrorException(
        'Failed to process request with AI provider',
      );
    }

    // 4. Save Assistant Message
    const assistantMessage = await this.prisma.chatMessage.create({
      data: {
        chatSessionId: chatId,
        role: MessageRole.ASSISTANT,
        content: aiResponse.message,
        metadata: aiResponse.metadata
          ? (aiResponse.metadata as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        status: MessageStatus.COMPLETED,
      },
    });

    // 5. Generate dynamic title if this is the first exchange
    const isFirstExchange = session.messages.length === 0;
    const computedTitle = isFirstExchange
      ? dto.content.slice(0, 30) + (dto.content.length > 30 ? '...' : '')
      : session.title;

    // 6. Update session metadata
    await this.prisma.chatSession.update({
      where: { id: chatId },
      data: {
        lastMessageAt: new Date(),
        title: computedTitle,
      },
    });

    return {
      userMessage,
      assistantMessage,
    };
  }

  /**
   * Updates proposal state inside a message's metadata after client-side CRUD execution.
   */
  async updateProposalStatus(
    userId: string,
    chatId: string,
    messageId: string,
    dto: UpdateProposalDto,
  ) {
    const message = await this.prisma.chatMessage.findFirst({
      where: {
        id: messageId,
        chatSessionId: chatId,
        chatSession: { userId },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found or unauthorized');
    }

    const currentMetadata = (message.metadata as AiResponseMetadata) || {};

    if (currentMetadata.type !== 'proposal' || !currentMetadata.proposal) {
      throw new BadRequestException(
        'Target message does not contain an active CRUD proposal',
      );
    }

    // Update proposal status nested inside JSON metadata
    const updatedProposal = {
      ...currentMetadata.proposal,
      status: dto.status,
      executionResult: dto.executionResult || null,
      updatedAt: new Date().toISOString(),
    };

    const updatedMetadata = {
      ...currentMetadata,
      proposal: updatedProposal,
    };

    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        metadata: updatedMetadata,
      },
    });
  }

  /**
   * Deletes a conversation session and cascades deletion of all contained messages.
   */
  async deleteConversation(userId: string, chatId: string) {
    const conversation = await this.prisma.chatSession.findFirst({
      where: { id: chatId, userId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    await this.prisma.chatSession.delete({
      where: { id: chatId },
    });

    return {
      message: 'Conversation deleted successfully',
    };
  }
}
