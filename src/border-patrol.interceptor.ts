import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { ZodError, z } from "zod";
import { catchError, map, Observable, throwError } from "rxjs";
import { BorderConfiguration } from "./types";
import { BorderPatrolException } from "./border-patrol.exception";

@Injectable()
export class BorderPatrolInterceptor<
  TBody extends z.ZodSchema | undefined,
  TQuery extends Record<string, z.ZodSchema | undefined> | undefined,
  TParams extends Record<string, z.ZodSchema | undefined> | undefined,
  TResponse extends z.ZodSchema | undefined
> implements NestInterceptor
{
  constructor(
    private readonly config: BorderConfiguration<
      TBody,
      TQuery,
      TParams,
      TResponse
    >
  ) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (!this.config.response) {
          return data;
        }
        // return this.config.response.parse(data);
        let parsedResponse: any;
        try {
          parsedResponse = this.config.response.parse(data);
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
