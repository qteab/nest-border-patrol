import { z } from 'zod';
import { HttpBorder } from '../HttpBorder';
import {
  Controller,
  Get,
  HttpStatus,
  INestApplication,
  Post,
  Query,
} from '@nestjs/common';
import { UseHttpBorder } from '../UseHttpBorder';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import { ParameterObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const border = new HttpBorder({
  parameters: {
    query: {
      required: z.string(),
      optional: z.string().optional(),
      nullable: z
        .object({
          prop: z.literal('SOME_VALUE'),
        })
        .nullable(),
    },
    path: {
      required: z.string(),
      optional: z.string().optional(),
      nullable: z
        .object({
          prop: z.literal('SOME_VALUE'),
        })
        .nullable(),
    },
  },
  requestBody: z.object({
    someKey: z.literal('SOME_BODY_VALUE'),
  }),
  responses: {
    [HttpStatus.OK]: z.object({
      status: z.literal('OK'),
    }),
    [HttpStatus.NOT_FOUND]: z.object({
      status: z.literal('NOT_FOUND'),
    }),
  },
});

@Controller({ path: 'test' })
export class TestController {
  @Post('/')
  @UseHttpBorder(border)
  public async get(@Query() query: any) {
    return {};
  }

  @Post('/400')
  @UseHttpBorder(
    new HttpBorder({
      responses: {
        [HttpStatus.BAD_REQUEST]: z.object({
          status: z.literal('BAD_REQUEST'),
        }),
      },
    })
  )
  public async badRequest() {
    return {};
  }
}

describe('Open API generation', () => {
  let app: INestApplication;
  let swaggerDocument: OpenAPIObject;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      controllers: [TestController],
    }).compile();

    app = module.createNestApplication();
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Nest Border Patrole Test API')
      .setDescription('Nest Border Patrole Test API')
      .setVersion('1.0')
      .build();
    swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('body', () => {
    it('generates a correct body specification', () => {
      const bodySpec = swaggerDocument.paths['/test']?.post?.requestBody;

      expect(bodySpec).toEqual({
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                someKey: {
                  type: 'string',
                  enum: ['SOME_BODY_VALUE'],
                },
              },
              required: ['someKey'],
            },
          },
        },
      });
    });
  });

  describe('path parameters', () => {
    it('handles required', () => {
      const parameters = swaggerDocument.paths['/test']?.post?.parameters;
      if (!parameters) {
        throw new Error('Parameters not set');
      }

      const parameter = parameters.find(
        (parameter): parameter is ParameterObject =>
          'name' in parameter &&
          parameter.name === 'required' &&
          parameter.in === 'path'
      );
      if (!parameter) {
        throw new Error("Could not find a parameter with name 'required'");
      }
      expect(parameter.required).toBe(true);
      expect(parameter.in).toBe('path');
      expect((parameter.schema as any).type).toBe('string');
    });

    it('handles optional', () => {
      const parameters = swaggerDocument.paths['/test']?.post?.parameters;
      if (!parameters) {
        throw new Error('Parameters not set');
      }

      const parameter = parameters.find(
        (parameter): parameter is ParameterObject =>
          'name' in parameter &&
          parameter.name === 'optional' &&
          parameter.in === 'path'
      );
      if (!parameter) {
        throw new Error("Could not find a parameter with name 'optional'");
      }
      expect(parameter.required).toBe(false);
      expect(parameter.in).toBe('path');
      expect((parameter.schema as any).type).toBe('string');
    });

    it('handles nullable objects', () => {
      const parameters = swaggerDocument.paths['/test']?.post?.parameters;
      if (!parameters) {
        throw new Error('Parameters not set');
      }

      const parameter = parameters.find(
        (parameter): parameter is ParameterObject =>
          'name' in parameter &&
          parameter.name === 'nullable' &&
          parameter.in === 'path'
      );
      if (!parameter) {
        throw new Error("Could not find a parameter with name 'nullable'");
      }
      expect(parameter.required).toEqual(true);
      expect(parameter.in).toBe('path');
      expect(parameter.schema).toEqual({
        type: ['object', 'null'],
        properties: { prop: { type: 'string', enum: ['SOME_VALUE'] } },
        required: ['prop'],
      });
    });
  });

  describe('query parameters', () => {
    it('handles required', () => {
      const parameters = swaggerDocument.paths['/test']?.post?.parameters;
      if (!parameters) {
        throw new Error('Parameters not set');
      }

      const parameter = parameters.find(
        (parameter): parameter is ParameterObject =>
          'name' in parameter &&
          parameter.name === 'required' &&
          parameter.in === 'query'
      );
      if (!parameter) {
        throw new Error("Could not find a parameter with name 'required'");
      }
      expect(parameter.required).toBe(true);
      expect(parameter.in).toBe('query');
      expect((parameter.schema as any).type).toBe('string');
    });

    it('handles optional', () => {
      const parameters = swaggerDocument.paths['/test']?.post?.parameters;
      if (!parameters) {
        throw new Error('Parameters not set');
      }

      const parameter = parameters.find(
        (parameter): parameter is ParameterObject =>
          'name' in parameter &&
          parameter.name === 'optional' &&
          parameter.in === 'query'
      );
      if (!parameter) {
        throw new Error("Could not find a parameter with name 'optional'");
      }
      expect(parameter.required).toBe(false);
      expect(parameter.in).toBe('query');
      expect((parameter.schema as any).type).toBe('string');
    });

    it('handles nullable objects', () => {
      const parameters = swaggerDocument.paths['/test']?.post?.parameters;
      if (!parameters) {
        throw new Error('Parameters not set');
      }

      const parameter = parameters.find(
        (parameter): parameter is ParameterObject =>
          'name' in parameter &&
          parameter.name === 'nullable' &&
          parameter.in === 'query'
      );
      if (!parameter) {
        throw new Error("Could not find a parameter with name 'nullable'");
      }
      expect(parameter.required).toEqual(true);
      expect(parameter.in).toBe('query');
      expect(parameter.schema).toEqual({
        type: ['object', 'null'],
        properties: { prop: { type: 'string', enum: ['SOME_VALUE'] } },
        required: ['prop'],
      });
    });
  });

  describe('responses', () => {
    it('generates user specified responses', () => {
      const responses = swaggerDocument.paths['/test']?.post?.responses;

      expect(responses?.['200']).toEqual({
        description: '',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['OK'],
                },
              },
              required: ['status'],
            },
          },
        },
      });

      expect(responses?.['404']).toEqual({
        description: '',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['NOT_FOUND'],
                },
              },
              required: ['status'],
            },
          },
        },
      });
    });

    it('generates border patrol 400 responses when user has not specified custom response', () => {
      const responses = swaggerDocument.paths['/test']?.post?.responses;

      expect(responses?.['400']).toEqual({
        description: '',
        content: {
          'application/json': {
            schema: {
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    code: {
                      type: 'string',
                      enum: ['INVALID_BODY'],
                    },
                  },
                  required: ['code'],
                },
                {
                  type: 'object',
                  properties: {
                    code: {
                      type: 'string',
                      enum: ['INVALID_PATH_PARAMETER'],
                    },
                  },
                  required: ['code'],
                },
                {
                  type: 'object',
                  properties: {
                    code: {
                      type: 'string',
                      enum: ['INVALID_QUERY_PARAMETER'],
                    },
                  },
                  required: ['code'],
                },
              ],
            },
          },
        },
      });
    });

    it('generates border patrol 400 responses when user has not specified custom response', () => {
      const responses = swaggerDocument.paths['/test/400']?.post?.responses;

      expect(responses?.['400']).toEqual({
        description: '',
        content: {
          'application/json': {
            schema: {
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['BAD_REQUEST'],
                    },
                  },
                  required: ['status'],
                },
                {
                  type: 'object',
                  properties: {
                    code: {
                      type: 'string',
                      enum: ['INVALID_BODY'],
                    },
                  },
                  required: ['code'],
                },
                {
                  type: 'object',
                  properties: {
                    code: {
                      type: 'string',
                      enum: ['INVALID_PATH_PARAMETER'],
                    },
                  },
                  required: ['code'],
                },
                {
                  type: 'object',
                  properties: {
                    code: {
                      type: 'string',
                      enum: ['INVALID_QUERY_PARAMETER'],
                    },
                  },
                  required: ['code'],
                },
              ],
            },
          },
        },
      });
    });
  });
});
