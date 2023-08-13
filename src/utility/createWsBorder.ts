import { z } from "zod";
import { BorderConfiguration } from "../types/BorderConfiguration";

export const createWsBorder = <TBody extends z.ZodSchema>(
  schema: TBody
): BorderConfiguration<TBody, undefined, undefined, undefined> => ({
  body: schema,
  query: undefined,
  params: undefined,
  response: undefined,
});
