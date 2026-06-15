import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Prisma } from '../../../generated/prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resBody = exception.getResponse();
      message =
        typeof resBody === 'object' && resBody !== null && 'message' in resBody
          ? (resBody as { message: string | string[] }).message
          : typeof resBody === 'string'
            ? resBody
            : exception.message;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          status = HttpStatus.CONFLICT;
          const target =
            (exception.meta?.target as string[])?.join(', ') || 'Field';
          message = `${target.charAt(0).toUpperCase() + target.slice(1)} already exists.`;
          break;
        }
        case 'P2003': {
          status = HttpStatus.BAD_REQUEST;
          message =
            'Foreign key constraint failed. A related record was not found.';
          break;
        }
        case 'P2025': {
          status = HttpStatus.NOT_FOUND;
          message =
            (exception.meta?.cause as string) ||
            'Record to update or delete not found.';
          break;
        }
        default:
          status = HttpStatus.BAD_REQUEST;
          message = exception.message.replace(/\n/g, '');
          break;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      errors: Array.isArray(message) ? message : [message],
    });
  }
}
