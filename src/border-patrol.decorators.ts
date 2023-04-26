import { applyDecorators, UseInterceptors, UsePipes } from "@nestjs/common";
import { generateSchema } from "@anatine/zod-openapi";
import { ApiBody, ApiOkResponse, ApiParam, ApiQuery } from "@nestjs/swagger";
import { BorderConfiguration } from "./types";
import { z } from "zod";
import { BorderPatrolInterceptor } from "./border-patrol.interceptor";
import { BorderPatrolPipe } from "./border-patrol.pipe";

export const UseBorder = <
  TBody extends z.ZodSchema | undefined,
  TQuery extends Record<string, z.ZodSchema | undefined> | undefined,
  TParams extends Record<string, z.ZodSchema | undefined> | undefined,
  TResponse extends z.ZodSchema | undefined
>(
  config: BorderConfiguration<TBody, TQuery, TParams, TResponse>
) => {
  const swaggerDecorators: MethodDecorator[] = [];

  if (config.response) {
    swaggerDecorators.push(
      ApiOkResponse({ schema: generateSchema(config.response) as any })
    );
  }
  if (config.body) {
    swaggerDecorators.push(
      ApiBody({ schema: generateSchema(config.body) as any })
    );
  }
  if (config.params) {
    Object.entries(config.params).forEach(([key, schema]) => {
      if (!schema) {
        return;
      }
      swaggerDecorators.push(
        ApiParam({ name: key, schema: generateSchema(schema) as any })
      );
    });
  }
  if (config.query) {
    Object.entries(config.query).forEach(([key, schema]) => {
      if (!schema) {
        return;
      }
      const generatedSchema = generateSchema(schema);
      swaggerDecorators.push(
        ApiQuery({
          name: key,
          required: !!schema.isOptional(),
          schema: generatedSchema as any,
        })
      );
    });
  }

  return applyDecorators(
    UseInterceptors(new BorderPatrolInterceptor(config)),
    UsePipes(new BorderPatrolPipe(config)),
    ...swaggerDecorators
  );
};

//
//
