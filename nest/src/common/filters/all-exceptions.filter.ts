import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/** The one error shape every endpoint returns. */
export interface ErrorResponse {
  statusCode: number;
  error: string; // machine-readable code, e.g. INVALID_CREDENTIALS
  message: string; // human-readable summary
  details?: string[]; // field-level validation messages, when there are any
  path: string;
  timestamp: string;
}

const DEFAULT_CODES: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  500: 'INTERNAL_SERVER_ERROR',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string | undefined;
    let message = 'Something went wrong';
    let details: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object') {
        const b = body as Record<string, unknown>;
        if (typeof b.code === 'string') code = b.code;
        if (Array.isArray(b.message)) {
          // class-validator returns an array of messages
          details = b.message.map(String);
          message = 'Validation failed';
          code ??= 'VALIDATION_ERROR';
        } else if (typeof b.message === 'string') {
          message = b.message;
        }
      }
    } else {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    const payload: ErrorResponse = {
      statusCode: status,
      error: code ?? DEFAULT_CODES[status] ?? 'ERROR',
      message,
      ...(details ? { details } : {}),
      path: req.url,
      timestamp: new Date().toISOString(), // wall clock is fine here: it's a log timestamp, not "today"
    };
    res.status(status).json(payload);
  }
}
