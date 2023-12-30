import { z } from 'zod';

export const DEFAULT_BAD_REQUEST_RESPONSE_SCHEMA = {
  body: z.object({
    code: z.literal('INVALID_BODY'),
  }),
  pathParameter: z.object({
    code: z.literal('INVALID_PATH_PARAMETER'),
  }),
  queryParameter: z.object({
    code: z.literal('INVALID_QUERY_PARAMETER'),
  }),
};
