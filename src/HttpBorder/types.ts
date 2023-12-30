import { HttpStatus } from '@nestjs/common';
import { HttpBorder } from './HttpBorder';
import { HttpBorderResponse } from './HttpBorderResponse';
import { z } from 'zod';

type InferHttpRequestBody<TBorder> = TBorder extends HttpBorder<
  infer TBody,
  any,
  any,
  any
>
  ? TBody extends z.ZodSchema
    ? z.infer<TBody>
    : never
  : never;

type InferHttpPathParameters<TBorder> = TBorder extends HttpBorder<
  any,
  infer TPathParameters,
  any,
  any
>
  ? TPathParameters extends Record<string, z.ZodSchema | undefined>
    ? {
        [K in keyof TPathParameters]: TPathParameters[K] extends z.ZodSchema
          ? z.infer<TPathParameters[K]>
          : never;
      }
    : TPathParameters extends undefined
    ? undefined
    : never
  : never;

type InferHttpQueryParameters<TBorder> = TBorder extends HttpBorder<
  any,
  any,
  infer TQueryParameters,
  any
>
  ? TQueryParameters extends Record<string, z.ZodSchema | undefined>
    ? {
        [K in keyof TQueryParameters]: TQueryParameters[K] extends z.ZodSchema
          ? z.infer<TQueryParameters[K]>
          : never;
      }
    : TQueryParameters extends undefined
    ? undefined
    : never
  : never;

type InferHttpResponse<TBorder> = TBorder extends HttpBorder<
  any,
  any,
  any,
  infer TResponses
>
  ? {
      [K in keyof TResponses]: K extends HttpStatus & keyof TResponses
        ? TResponses[K] extends z.ZodSchema
          ? HttpBorderResponse<K, z.infer<TResponses[K]>>
          : never
        : never;
      //
    }[keyof TResponses]
  : never;

export type InferFromHttpBorder<
  TBorder extends HttpBorder<any, any, any, any>,
  TFrom extends
    | 'pathParameters'
    | 'queryParameters'
    | 'requestBody'
    | 'response'
> = TFrom extends 'pathParameters'
  ? InferHttpPathParameters<TBorder>
  : TFrom extends 'queryParameters'
  ? InferHttpQueryParameters<TBorder>
  : TFrom extends 'requestBody'
  ? InferHttpRequestBody<TBorder>
  : TFrom extends 'response'
  ? InferHttpResponse<TBorder>
  : never;

// const b = new HttpBorder({
//   parameters: {
//     query: {
//       kalas: z.literal('kalas'),
//     },
//     path: {
//       hoho: z.literal('hihi'),
//     },
//   },
//   requestBody: z.object({
//     haha: z.literal('hoho'),
//   }),
//   responses: {
//     [HttpStatus.OK]: z.object({
//       status: z.literal('OK'),
//     }),
//     [HttpStatus.AMBIGUOUS]: z.object({
//       status: z.literal('AMBIGOUS'),
//     }),
//   },
// });

// type R = InferHttpResponse<typeof b>;
// type Ri = InferFromBorder<typeof b, 'response'>;

// type B = InferHttpRequestBody<typeof b>;
// type Bi = InferFromBorder<typeof b, 'requestBody'>;
// type P = InferHttpPathParameters<typeof b>;
// type Pi = InferFromBorder<typeof b, 'pathParameters'>;
// type Q = InferHttpQueryParameters<typeof b>;
// type Qi = InferFromBorder<typeof b, 'queryParameters'>;

// const r: R = b.createResponse(HttpStatus.AMBIGUOUS, { status: 'AMBIGOUS' });
