import { z } from "zod";
import {
  ApiResponseType,
  BorderConfiguration
} from "../types/BorderConfiguration";
import { ApiOperationOptions } from "@nestjs/swagger";

export const createBorder = <
  TBody extends z.ZodSchema | undefined,
  TQuery extends Record<string, z.ZodSchema | undefined> | undefined,
  TParams extends Record<string, z.ZodSchema | undefined> | undefined,
  TResponse extends ApiResponseType | undefined,
  TMetadata extends ApiOperationOptions | undefined
>({
  body,
  query,
  params,
  responses,
  meta,
}: {
  body?: TBody;
  query?: TQuery;
  params?: TParams;
  responses?: TResponse;
  meta?: TMetadata;
}): BorderConfiguration<TBody, TQuery, TParams, TResponse, TMetadata> => ({
  body: body as TBody,
  query: query as TQuery,
  params: params as TParams,
  responses: responses as TResponse,
  meta: meta as TMetadata,
});
