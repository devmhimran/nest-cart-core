import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

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
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Your custom response structure
    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      // If it's a validation array, keep it as an array, otherwise make it a single string array
      errors: Array.isArray(message) ? message : [message],
    });
  }
}
