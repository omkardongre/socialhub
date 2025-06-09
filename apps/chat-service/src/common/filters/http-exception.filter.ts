import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ChatExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ChatExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Chat service error';

    // Log the error with context (do not log sensitive info)
    const logPayload = {
      path: request.url,
      method: request.method,
      statusCode: status,
      message: typeof message === 'object' ? message['message'] : message,
      // You may add user id/email here if available in request (avoid sensitive info)
    };

    if (status >= 500) {
      // For server errors, log stack if available
      this.logger.error('Unhandled exception', {
        ...logPayload,
        stack: exception instanceof Error ? exception.stack : undefined,
      });
    } else {
      // For client errors, log as warning
      this.logger.warn('Handled exception', logPayload);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message: typeof message === 'object' ? message['message'] : message,
    });
  }
}
