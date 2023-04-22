import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { z } from "zod";
import { catchError, map, Observable, throwError } from "rxjs";
import { BorderConfiguration } from "./types";

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
          console.log("ERROR", JSON.stringify(err));
          throw new HttpException(
            { error: "Could not validate response" },
            HttpStatus.INTERNAL_SERVER_ERROR,
            { cause: err instanceof Error ? err : undefined }
          );
        }
        return parsedResponse;
      })
    );
  }
}
