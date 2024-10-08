import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const error = exception.getResponse() as
      | string
      | { error: string; statusCode: number; message: string | string[] };

    if (typeof error === 'string') {
      res.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        message: error,
        data: null,
      });
    } else {
      res.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        message: error,
        data: null,
      });
    }
  }
}
