import {
  applyDecorators,
  SetMetadata,
  UseInterceptors,
  UsePipes,
} from "@nestjs/common";
import { generateSchema } from "@anatine/zod-openapi";
import { ApiBody, ApiOkResponse, ApiParam, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { Banger, BorderConfiguration } from "./types";
import { z } from "zod";
import { BorderPatrolInterceptor } from "./border-patrol.interceptor";
import { BorderPatrolPipe } from "./border-patrol.pipe";
import { BORDER_CONFIGURATION_KEY } from "./border-patrol.constants";
import { createZodDto } from '@abitia/zod-dto'

export const UseBorder = <
  TBody extends z.ZodSchema | undefined,
  TQuery extends Record<string, z.ZodSchema | undefined> | undefined,
  TParams extends Record<string, z.ZodSchema | undefined> | undefined,
  TResponse extends Banger | undefined
>(
  config: BorderConfiguration<TBody, TQuery, TParams, TResponse>
) => {
  const swaggerDecorators: MethodDecorator[] = [];

  if (config.responses) {
    swaggerDecorators.push(...config.responses.map((response) => {
      if (!response.body) {
        return ApiOkResponse({ status: response.status });
      }

      const clazz = createZodDto(response.body);
      Object.defineProperty(clazz, 'name', { value: response.name })

      return ApiResponse({
        status: response.status,
        type: clazz,
      });
    }));
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
          required: !schema.isOptional(),
          schema: generatedSchema as any,
        })
      );
    });
  }

  return applyDecorators(
    UseInterceptors(new BorderPatrolInterceptor(config)),
    UsePipes(new BorderPatrolPipe(config)),
    SetMetadata(BORDER_CONFIGURATION_KEY, config),
    ...swaggerDecorators
  );
};

export const UseWsBorder = () => {
  return applyDecorators(UsePipes(new BorderPatrolPipe({} as any)));
};
