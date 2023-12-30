import { generateSchema } from '@anatine/zod-openapi';
import {
  HttpStatus,
  UseFilters,
  UseInterceptors,
  UsePipes,
  applyDecorators,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { z } from 'zod';
import { HttpBorder } from './HttpBorder';
import { HttpBorderFilter } from './HttpBorderFilter';
import { HttpBorderInterceptor } from './HttpBorderInterceptor';
import { HttpBorderPipe } from './HttpBorderPipe';
import { DEFAULT_BAD_REQUEST_RESPONSE_SCHEMA } from './defaultBadRequestResponseSchema';

export const UseHttpBorder = <
  TBody extends z.ZodSchema | undefined,
  TQuery extends Record<string, z.ZodSchema | undefined>,
  TParams extends Record<string, z.ZodSchema | undefined>,
  TResponses extends { [K in HttpStatus]?: z.ZodSchema }
>(
  border: HttpBorder<TBody, TParams, TQuery, TResponses>
) => {
  const swaggerDecorators: MethodDecorator[] = [];

  const bodySchema = border.getBodySchema();
  if (bodySchema) {
    swaggerDecorators.push(
      ApiBody({ schema: generateSchema(bodySchema) as any })
    );
  }

  const paramsSchema = border.getParamsSchema();
  if (paramsSchema) {
    Object.entries(paramsSchema).forEach(([key, schema]) => {
      if (!schema) {
        return;
      }
      swaggerDecorators.push(
        ApiParam({
          name: key,
          required: !schema.isOptional(),
          schema: generateSchema(schema) as any,
        })
      );
    });
    swaggerDecorators.push();
  }

  const querySchema = border.getQuerySchema();
  if (querySchema) {
    Object.entries(querySchema).forEach(([key, schema]) => {
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

  const responsesSchema = border.getResponsesSchema();
  let badRequestSchemasAdded = false;
  if (responsesSchema) {
    Object.entries(responsesSchema).forEach(([code, schema]) => {
      if (code === HttpStatus.BAD_REQUEST.toString()) {
        swaggerDecorators.push(
          ApiResponse({
            status: Number(code),
            schema: generateSchema(
              z.union([
                schema,
                DEFAULT_BAD_REQUEST_RESPONSE_SCHEMA.body,
                DEFAULT_BAD_REQUEST_RESPONSE_SCHEMA.pathParameter,
                DEFAULT_BAD_REQUEST_RESPONSE_SCHEMA.queryParameter,
              ])
            ) as any,
          })
        );
        badRequestSchemasAdded = true;
        return;
      }
      swaggerDecorators.push(
        ApiResponse({
          status: Number(code),
          schema: generateSchema(schema) as any,
        })
      );
    });
  }

  if (!badRequestSchemasAdded) {
    swaggerDecorators.push(
      ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        schema: generateSchema(
          z.union([
            DEFAULT_BAD_REQUEST_RESPONSE_SCHEMA.body,
            DEFAULT_BAD_REQUEST_RESPONSE_SCHEMA.pathParameter,
            DEFAULT_BAD_REQUEST_RESPONSE_SCHEMA.queryParameter,
          ])
        ) as any,
      })
    );
  }

  return applyDecorators(
    UseInterceptors(new HttpBorderInterceptor(border)),
    UsePipes(new HttpBorderPipe(border)),
    UseFilters(new HttpBorderFilter()),
    ...swaggerDecorators
  );
};
