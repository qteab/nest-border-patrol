// Old stuff

export type {
  InferBody,
  InferFromBorder,
  InferMessageBody,
  InferParams,
  InferQuery,
  InferResponse,
} from './types';
export { createBorder, createWsBorder } from './utility';
export { UseBorder } from './border-patrol.decorators';
export { extendApi as extendBorder } from '@anatine/zod-openapi';
export { BorderPatrolModule } from './border-patrol.module';
export { BorderPatrolException } from './border-patrol.exception';

// New stuff
export { HttpBorder, UseHttpBorder } from './HttpBorder';
export type { InferFromHttpBorder } from './HttpBorder';
