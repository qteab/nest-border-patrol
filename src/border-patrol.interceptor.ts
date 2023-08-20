import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, map } from "rxjs";
import { ZodError, z } from "zod";
import { BorderPatrolException } from "./border-patrol.exception";
import { ApiResponseType, BorderConfiguration } from "./types";
import { ApiOperationOptions } from "@nestjs/swagger";

@Injectable()
export class BorderPatrolInterceptor<
  TBody extends z.ZodSchema | undefined,
  TQuery extends Record<string, z.ZodSchema | undefined> | undefined,
  TParams extends Record<string, z.ZodSchema | undefined> | undefined,
  TResponse extends ApiResponseType | undefined,
  TMetadata extends ApiOperationOptions | undefined
> implements NestInterceptor
{
  constructor(
    private readonly config: BorderConfiguration<
      TBody,
      TQuery,
      TParams,
      TResponse,
      TMetadata
    >
  ) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (!this.config.responses) {
          return data;
        }
        // return this.config.response.parse(data);
        let parsedResponse: any;
        try {
          const statusCode = context
            .switchToHttp()
            .getResponse()
            .statusCode;

          if (!this.config.responses || this.config.responses.length === 0) {
            return data;
          }

          const schemaMatchingStatusCode = this.config.responses.find(
            (r) => r.status === statusCode
          );

          if (!schemaMatchingStatusCode) {
            throw new BorderPatrolException("response", new ZodError([]));
          }

          if (!schemaMatchingStatusCode.body) {
            return data;
          }

          parsedResponse = schemaMatchingStatusCode.body.parse(data);
        } catch (err) {
          if (err instanceof ZodError) {
            throw new BorderPatrolException(
              "response",
              err
              // { error: "Could not validate response" },
              // HttpStatus.INTERNAL_SERVER_ERROR,
              // { cause: err instanceof Error ? err : undefined }
            );
          }
          throw err;
        }
        return parsedResponse;
      })
    );
  }
}
