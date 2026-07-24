import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
  AiResponseMetadata,
} from '../ai/interfaces/ai-provider.interface';
import type { Response } from 'express';

interface StreamChunk {
  text?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class ChatService {
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
      // Send error frame and close response stream
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

    // 3. Stream from AI Provider
    let fullContent = '';
    let metadata: Record<string, any> | undefined;

    try {
      const stream = (await this.aiService.generateResponse(
        history,
      )) as unknown as AsyncIterable<string | StreamChunk>;

      for await (const rawChunk of stream) {
        // If your AI provider returns object chunks containing metadata alongside text tokens:
        if (typeof rawChunk === 'string') {
          fullContent += rawChunk;
          res.write(
            `data: ${JSON.stringify({ type: 'token', content: rawChunk })}\n\n`,
          );
        } else if (rawChunk?.text) {
          fullContent += rawChunk.text;
          if (rawChunk.metadata) metadata = rawChunk.metadata;
          res.write(
            `data: ${JSON.stringify({ type: 'token', content: rawChunk.text })}\n\n`,
          );
        }
      }
    } catch {
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

    // 4. Save assistant message after full response stream finishes
    const assistantMessage = await this.prisma.chatMessage.create({
      data: {
        chatSessionId: chatId,
        role: MessageRole.ASSISTANT,
        content: fullContent,
        metadata: metadata
          ? (metadata as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        status: MessageStatus.COMPLETED,
      },
    });

    // 5. Update session timing and initial title
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

    // Signal stream end and pass final assistant message
    res.write(
      `data: ${JSON.stringify({
        type: 'done',
        assistantMessage,
      })}\n\n`,
    );

    res.end();
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
