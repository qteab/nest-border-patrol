import { z } from "zod";
import { BorderConfiguration } from "../types/BorderConfiguration";

/**
 * @deprecated
 */
export const createBorder = <
  TBody extends z.ZodSchema | undefined,
  TQuery extends Record<string, z.ZodSchema | undefined> | undefined,
  TParams extends Record<string, z.ZodSchema | undefined> | undefined,
  TResponse extends z.ZodSchema | undefined
>({
  body,
  query,
  params,
  response,
}: {
  body?: TBody;
  query?: TQuery;
  params?: TParams;
  response?: TResponse;
}): BorderConfiguration<TBody, TQuery, TParams, TResponse> => ({
  body: body as TBody,
  query: query as TQuery,
  params: params as TParams,
  response: response as TResponse,
});
