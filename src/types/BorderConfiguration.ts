import { z } from "zod";

export type Banger = Array<{
  status: number;
  name: string;
  body: z.ZodSchema
}>;

export type BorderConfiguration<
  TBody extends z.ZodSchema | undefined,
  TQuery extends Record<string, z.ZodSchema | undefined> | undefined,
  TParams extends Record<string, z.ZodSchema | undefined> | undefined,
  TResponse extends Banger | undefined
> = {
  query: TQuery;
  params: TParams;
  body: TBody;
  responses: TResponse;
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
    ? TResponse extends Banger
      ? TResponse[number] extends {
          body: z.ZodSchema;
        }
        ? {
            [K in keyof TResponse]: TResponse[K] extends {
              body: z.ZodSchema;
            }
              ? z.infer<TResponse[K]["body"]>
              : never;
          }[number]
        : never
      : never
    : never;

export type InferMessageBody<TConfiguration> = InferBody<TConfiguration>;

export type InferFromBorder<
  TConfiguration,
  TPath = "body" | "messageBody" | "params" | "query" | "response"
> = TPath extends "params"
  ? InferParams<TConfiguration>
  : TPath extends "query"
  ? InferQuery<TConfiguration>
  : TPath extends "response"
  ? InferResponse<TConfiguration>
  : InferBody<TConfiguration>;
