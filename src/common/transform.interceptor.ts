import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

// export const info = {
//   statusCode: 200,
//   message: 'success',
// };

export function createResponseInfo(statusCode: number = 200) {
  return {
    statusCode,
    message: 'success',
  };
}

// export type Response<T> = typeof info & {
//   data: T;
// }

export type Response<T> = ReturnType<typeof createResponseInfo> & {
  data: T;
};

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<Text, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const res = context.switchToHttp().getResponse();
    const status = res.statusCode;
    return next
      .handle()
      .pipe(
        map((data) => Object.assign({}, createResponseInfo(status), { data })),
      );
  }
}
