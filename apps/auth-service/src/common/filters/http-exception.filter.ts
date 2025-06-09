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
export class AuthExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AuthExceptionFilter.name);

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
        : 'Authentication service error';

    // Log the error with context (do not log sensitive info)
    const logPayload = {
      path: request.url,
      method: request.method,
      statusCode: status,
      // You may add user id/email here if available in request (avoid sensitive info)
      message: typeof message === 'object' ? message['message'] : message,
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
