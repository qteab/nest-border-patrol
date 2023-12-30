import {
  ArgumentMetadata,
  HttpStatus,
  Injectable,
  NotImplementedException,
  PipeTransform,
} from '@nestjs/common';
import { HttpBorder } from './HttpBorder';
import { z } from 'zod';
import {
  InvalidBodyError,
  InvalidPathParameterError,
  InvalidQueryParameterError,
} from './errors';

@Injectable()
export class HttpBorderPipe<
  TBody extends z.ZodSchema | undefined,
  TParams extends Record<string, z.ZodSchema | undefined>,
  TQuery extends Record<string, z.ZodSchema | undefined>,
  TResponses extends { [K in HttpStatus]?: z.ZodSchema }
> implements PipeTransform
{
  private border: HttpBorder<TBody, TParams, TQuery, TResponses>;
  constructor(border: HttpBorder<TBody, TParams, TQuery, TResponses>) {
    this.border = border;
  }

  transform(value: any, metadata: ArgumentMetadata) {
    switch (metadata.type) {
      case 'body': {
        if (metadata.data) {
          throw new NotImplementedException();
        }
        const schema = this.border.getBodySchema();
        if (!schema) {
          return undefined;
        }
        const result = schema.safeParse(value);
        if (result.success) {
          return result.data;
        }
        throw new InvalidBodyError();
      }
      case 'custom': {
        return value;
      }
      case 'param': {
        if (metadata.data) {
          throw new NotImplementedException('Pipe does not support subpaths');
        }
        const schemas = this.border.getParamsSchema();
        const parsedValue: any = {};
        Object.entries(schemas)
          .filter(
            (entry): entry is [string, NonNullable<(typeof entry)[1]>] => {
              if (!entry[1]) {
                return false;
              }
              return true;
            }
          )
          .forEach(([key, schema]) => {
            const result = schema.safeParse(value[key]);
            if (result.success) {
              parsedValue[key] = result.data;
              return;
            }
            throw new InvalidPathParameterError();
          });
        return parsedValue;
      }
      case 'query': {
        if (metadata.data) {
          throw new NotImplementedException('Pipe does not support subpaths');
        }
        const schemas = this.border.getQuerySchema();
        const parsedValue: any = {};
        Object.entries(schemas)
          .filter(
            (entry): entry is [string, NonNullable<(typeof entry)[1]>] => {
              if (!entry[1]) {
                return false;
              }
              return true;
            }
          )
          .forEach(([key, schema]) => {
            const result = schema.safeParse(value[key]);
            if (result.success) {
              parsedValue[key] = result.data;
              return;
            }
            throw new InvalidQueryParameterError();
          });
        return parsedValue;
      }
    }
  }
}
