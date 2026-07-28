import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

import {
  AiChatMessage,
  AiResponseMetadata,
} from '../ai/interfaces/ai-provider.interface';
import { AiService } from '../ai/ai.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Prisma } from '../../generated/prisma/client';
import { SendMessageDto } from './dto/send-message.dto';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/pagination/paginate.util';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { MessageRole, MessageStatus } from '../constants/enums';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async createConversation(userId: string, dto: CreateChatDto, res?: Response) {
    const session = await this.prisma.chatSession.create({
      data: {
        userId,
        title: dto.title ?? 'New Chat',
        lastMessageAt: new Date(),
      },
    });

    if (dto.initialMessage) {
      if (!res) {
        throw new Error('Response object is required for streaming');
      }

      res.write(
        `data: ${JSON.stringify({
          type: 'session_created',
          session,
        })}\n\n`,
      );

      return this.sendMessageStream(
        userId,
        session.id,
        {
          content: dto.initialMessage,
        },
        res,
      );
    }

    return session;
  }

  async sendMessageStream(
    userId: string,
    chatId: string,
    dto: SendMessageDto,
    res: Response,
  ): Promise<void> {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: chatId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          message: 'Conversation not found',
        })}\n\n`,
      );
      res.end();
      return;
    }

    // 1. Save user message immediately
    const userMessage = await this.prisma.chatMessage.create({
      data: {
        chatSessionId: chatId,
        role: MessageRole.USER,
        content: dto.content,
        status: MessageStatus.COMPLETED,
      },
    });

    // Notify client about created user message
    res.write(
      `data: ${JSON.stringify({
        type: 'user_message_created',
        userMessage,
      })}\n\n`,
    );

    // 2. Prepare message history
    const history: AiChatMessage[] = session.messages.map((msg) => ({
      role:
        (msg.role as MessageRole) === MessageRole.USER
          ? MessageRole.USER
          : MessageRole.ASSISTANT,
      content: msg.content,
    }));
    history.push({ role: MessageRole.USER, content: dto.content });

    let rawAccumulatedJson = '';

    try {
      const stream = this.aiService.generateResponseStream(history);

      for await (const chunk of stream) {
        if (typeof chunk === 'string') {
          rawAccumulatedJson += chunk;

          // Stream raw tokens to the client
          res.write(
            `data: ${JSON.stringify({ type: 'token', content: chunk })}\n\n`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error during AI streaming:', error);

      await this.prisma.chatMessage.create({
        data: {
          chatSessionId: chatId,
          role: MessageRole.ASSISTANT,
          content: 'An error occurred while generating a response.',
          status: MessageStatus.FAILED,
        },
      });

      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          message: 'Failed to process request with AI provider',
        })}\n\n`,
      );
      res.end();
      return;
    }

    let finalContent = rawAccumulatedJson;
    let metadata: Record<string, unknown> = { type: 'text' };

    try {
      const sanitized = rawAccumulatedJson
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

      const parsed = JSON.parse(sanitized) as {
        message?: string;
        metadata?: Record<string, unknown>;
      };

      if (parsed && typeof parsed === 'object' && parsed.message) {
        finalContent = parsed.message;
        if (parsed.metadata) {
          metadata = parsed.metadata;
        }
      }
    } catch {
      finalContent = rawAccumulatedJson;
    }

    const assistantMessage = await this.prisma.chatMessage.create({
      data: {
        chatSessionId: chatId,
        role: MessageRole.ASSISTANT,
        content: finalContent,
        metadata: metadata as unknown as Prisma.InputJsonValue,
        status: MessageStatus.COMPLETED,
      },
    });

    const isFirstExchange = session.messages.length === 0;
    const computedTitle = isFirstExchange
      ? dto.content.slice(0, 30) + (dto.content.length > 30 ? '...' : '')
      : session.title;

    await this.prisma.chatSession.update({
      where: { id: chatId },
      data: {
        lastMessageAt: new Date(),
        title: computedTitle,
      },
    });

    res.write(
      `data: ${JSON.stringify({
        type: 'done',
        assistantMessage,
      })}\n\n`,
    );

    res.end();
  }

  async getConversations(userId: string, query: PaginationQueryDto) {
    return paginate(this.prisma.chatSession, query, {
      where: { userId },
      orderBy: { id: 'desc' },
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
