import { HttpStatus } from '@nestjs/common';
import { z } from 'zod';
import { HttpBorderResponse } from './HttpBorderResponse';

export class HttpBorder<
  TBody extends z.ZodSchema | undefined,
  TParams extends Record<string, z.ZodSchema | undefined>,
  TQuery extends Record<string, z.ZodSchema | undefined>,
  TResponses extends { [K in HttpStatus]?: z.ZodSchema }
> {
  private readonly bodySchema: TBody;
  private readonly paramsSchema: TParams;
  private readonly querySchema: TQuery;
  private readonly responsesSchema: TResponses;

  constructor(options: {
    requestBody?: TBody;
    parameters?: {
      path?: TParams;
      query?: TQuery;
    };
    responses: TResponses;
  }) {
    this.bodySchema = options.requestBody || (undefined as unknown as TBody);
    this.paramsSchema = options.parameters?.path || ({} as unknown as TParams);
    this.querySchema = options.parameters?.query || ({} as unknown as TQuery);
    this.responsesSchema = options.responses;
  }

  public createResponse<TCode extends HttpStatus>(
    statusCode: TCode,
    body: TCode extends keyof TResponses
      ? TResponses[TCode] extends z.ZodSchema
        ? z.infer<TResponses[TCode]>
        : never
      : never
  ) {
    return new HttpBorderResponse({
      statusCode,
      body,
    });
  }

  public getBodySchema() {
    return this.bodySchema;
  }

  public getParamsSchema() {
    return this.paramsSchema;
  }

  public getQuerySchema() {
    return this.querySchema;
  }

  public getResponseSchema<TCode extends HttpStatus>(
    code: TCode
  ): z.ZodSchema | undefined {
    return this.responsesSchema[code];
  }

  public getResponsesSchema() {
    return this.responsesSchema;
  }
}
