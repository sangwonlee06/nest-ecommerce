import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP');
  intercept(context: ExecutionContext, next: CallHandler) {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    response.on('finish', () => {
      const { method, originalUrl } = request;
      const { statusCode, statusMessage } = response;
      const message = `${method} ${originalUrl} ${statusCode} ${statusMessage}`;

      if (statusCode >= 500) {
        return this.logger.error(message);
      }
      if (statusCode >= 400) {
        return this.logger.warn(message);
      }
      return this.logger.log(message);
    });
    return next.handle();
  }
}
