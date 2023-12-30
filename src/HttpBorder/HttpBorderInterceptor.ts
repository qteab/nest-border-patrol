import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { HttpBorder } from './HttpBorder';
import type { Response, Request } from 'express';
import { HttpBorderResponse } from './HttpBorderResponse';

@Injectable()
export class HttpBorderInterceptor implements NestInterceptor {
  constructor(private readonly border: HttpBorder<any, any, any, any>) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCodeFromNest = response.statusCode;
    // response.st
    return next.handle().pipe(
      map(data => {
        let body: any;
        let statusCode: HttpStatus;
        if (data instanceof HttpBorderResponse) {
          statusCode = data.statusCode;
          body = data.body;
        } else {
          statusCode = statusCodeFromNest;
          body = data;
        }

        response.statusCode = statusCode;

        const responseSchema = this.border.getResponseSchema(statusCode);
        if (!responseSchema) {
          throw new Error(
            `No response schema defined for status code "${statusCodeFromNest}" path: "${request.path}"`
          );
        }
        const result = responseSchema.safeParse(body);
        if (result.success) {
          return result.data;
        }
        throw result.error;
        // const responseSchema =
        // if (!this.border.getResponseSchema()) {
        //   return data;
        // }
        // // return this.config.response.parse(data);
        // let parsedResponse: any;
        // try {
        //   parsedResponse = this.config.response.parse(data);
        // } catch (err) {
        //   if (err instanceof ZodError) {
        //     throw new BorderPatrolException(
        //       'response',
        //       err
        //       // { error: "Could not validate response" },
        //       // HttpStatus.INTERNAL_SERVER_ERROR,
        //       // { cause: err instanceof Error ? err : undefined }
        //     );
        //   }
        //   throw err;
        // }
        // return parsedResponse;
      })
    );
  }
}
