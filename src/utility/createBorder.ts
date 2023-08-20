import { z } from "zod";
import {
  Banger,
  BorderConfiguration
} from "../types/BorderConfiguration";

export const createBorder = <
  TBody extends z.ZodSchema | undefined,
  TQuery extends Record<string, z.ZodSchema | undefined> | undefined,
  TParams extends Record<string, z.ZodSchema | undefined> | undefined,
  TResponse extends Banger | undefined
>({
  body,
  query,
  params,
  responses,
}: {
  body?: TBody;
  query?: TQuery;
  params?: TParams;
  responses?: TResponse;
}): BorderConfiguration<TBody, TQuery, TParams, TResponse> => ({
  body: body as TBody,
  query: query as TQuery,
  params: params as TParams,
  responses: responses as TResponse,
});
