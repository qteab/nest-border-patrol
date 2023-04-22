import { z } from "zod";

export type BorderConfiguration<
  TBody extends z.ZodSchema | undefined,
  TQuery extends Record<string, z.ZodSchema | undefined> | undefined,
  TParams extends Record<string, z.ZodSchema | undefined> | undefined,
  TResponse extends z.ZodSchema | undefined
> = {
  query: TQuery;
  params: TParams;
  body: TBody;
  response: TResponse;
};

export type InferBody<TConfiguration> =
  TConfiguration extends BorderConfiguration<infer TBody, any, any, any>
    ? TBody extends z.ZodSchema
      ? z.infer<TBody>
      : TBody extends undefined
      ? undefined
      : never
    : never;

export type InferQuery<TConfiguration> =
  TConfiguration extends BorderConfiguration<any, infer TQuery, any, any>
    ? TQuery extends Record<string, z.ZodSchema | undefined>
      ? {
          [K in keyof TQuery]: TQuery[K] extends z.ZodSchema
            ? z.infer<TQuery[K]>
            : never;
        }
      : TQuery extends undefined
      ? undefined
      : never
    : never;

export type InferParams<TConfiguration> =
  TConfiguration extends BorderConfiguration<any, any, infer TParams, any>
    ? TParams extends Record<string, z.ZodSchema | undefined>
      ? {
          [K in keyof TParams]: TParams[K] extends z.ZodSchema
            ? z.infer<TParams[K]>
            : never;
        }
      : TParams extends undefined
      ? undefined
      : never
    : never;

export type InferResponse<TConfiguration> =
  TConfiguration extends BorderConfiguration<any, any, any, infer TResponse>
    ? TResponse extends z.ZodSchema
      ? z.infer<TResponse>
      : TResponse extends undefined
      ? any
      : never
    : never;
