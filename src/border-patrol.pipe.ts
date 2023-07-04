import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  NotImplementedException,
  PipeTransform,
} from "@nestjs/common";
import { z, ZodError } from "zod";
import { BorderConfiguration } from "./types";
import { BorderPatrolException } from "./border-patrol.exception";

@Injectable()
export class BorderPatrolPipe<
  TBody extends z.ZodSchema | undefined,
  TQuery extends Record<string, z.ZodSchema | undefined> | undefined,
  TParams extends Record<string, z.ZodSchema | undefined> | undefined,
  TResponse extends z.ZodSchema | undefined
> implements PipeTransform
{
  constructor(
    private readonly config: BorderConfiguration<
      TBody,
      TQuery,
      TParams,
      TResponse
    >
  ) {}

  public transform(value: any, metadata: ArgumentMetadata) {
    try {
      switch (metadata.type) {
        case "body":
          if (metadata.data) {
            throw new NotImplementedException();
          }
          return this.config.body ? this.config.body.parse(value) : undefined;
        case "query": {
          if (!this.config.query) {
            return undefined;
          }

          if (metadata.data) {
            const schema = this.config.query[metadata.data];
            if (!schema) {
              return undefined;
            }
            return schema.parse(value);
          }

          const parsedValue: any = {};
          Object.entries(this.config.query)
            .filter(
              (entry): entry is [string, NonNullable<(typeof entry)[1]>] => {
                if (!entry[1]) {
                  return false;
                }
                return true;
              }
            )
            .forEach(([key, schema]) => {
              parsedValue[key] = schema.parse(value[key]);
            });
          return parsedValue;
        }
        case "param": {
          if (!this.config.params) {
            return undefined;
          }
          if (metadata.data) {
            const schema = this.config.params[metadata.data];
            if (!schema) {
              return undefined;
            }
            return schema.parse(value);
          }
          const parsedValue: any = {};
          Object.entries(this.config.params)
            .filter(
              (entry): entry is [string, NonNullable<(typeof entry)[1]>] => {
                if (!entry[1]) {
                  return false;
                }
                return true;
              }
            )
            .forEach(([key, schema]) => {
              parsedValue[key] = schema.parse(value[key]);
            });
          return parsedValue;
        }
        case "custom":
          return value;
        default:
          throw new NotImplementedException("Unexpected metadata.type");
      }
    } catch (err) {
      if (err instanceof ZodError) {
        let where: ConstructorParameters<typeof BorderPatrolException>[0];
        if (metadata.type === "custom") {
          throw err;
        }
        if (metadata.type === "param") {
          where = "params";
        } else {
          where = metadata.type;
        }
        throw new BorderPatrolException(where, err);
        // throw new BorderPatrolException(
        //   {
        //     message: `Error in ${metadata.type}${
        //       metadata.data ? `.${metadata.data}` : ""
        //     }`,
        //     formattedError: err.format(),
        //     error: err,
        //   },
        //   HttpStatus.BAD_REQUEST,
        //   {
        //     cause: err,
        //   }
        // );
      }
      throw err;
    }
  }
}
