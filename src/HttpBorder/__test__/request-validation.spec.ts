import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  INestApplication,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UseHttpBorder } from '../UseHttpBorder';
import { HttpBorder } from '../HttpBorder';
import { z } from 'zod';
import { BorderPatrolModule } from '~/border-patrol.module';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { InvalidBodyError } from '../errors';

const border = new HttpBorder({
  requestBody: z.object({
    name: z.string(),
  }),
  parameters: {
    query: {
      required: z.string(),
      optional: z.string().optional(),
    },
    path: {
      someParam: z.literal('correct'),
    },
  },

  responses: {
    [HttpStatus.CREATED]: z.any(),
  },
});
@Controller({
  path: 'test',
})
class TestController {
  @Post('/:someParam')
  @UseHttpBorder(border)
  public plainValid(
    @Body() body: any,
    @Param() params: any,
    @Query() query: any
  ) {
    return {
      body,
      query,
      params,
    };
  }
}

const validBodyFixture = {
  name: 'Anders',
};

const validQueryFixture = {
  required: 'Hello',
  optional: 'World',
};

const validQueryStringFixture = new URLSearchParams(
  validQueryFixture
).toString();

const validParamsFixture = {
  someParam: 'correct',
};

const pathWithValidParamsFixture = `/test/${validParamsFixture.someParam}`;

describe('UseHttpBorder request validation', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        BorderPatrolModule.forRootAsync({
          useFactory: () => ({}),
        }),
      ],
      controllers: [TestController],
    }).compile();

    app = module.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('body', () => {
    it('lets a valid body pass through', async () => {
      const response = await request(app.getHttpServer())
        .post(`${pathWithValidParamsFixture}?${validQueryStringFixture}`)
        .send(validBodyFixture);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        body: validBodyFixture,
        params: validParamsFixture,
        query: validQueryFixture,
      });
    });

    it('responds with 400 when body is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post(`${pathWithValidParamsFixture}?${validQueryStringFixture}`)
        .send({
          invalid: 'stuff',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: 'INVALID_BODY',
      });
    });
  });

  describe('path parmas', () => {
    it('lets a valid params pass through', async () => {
      const response = await request(app.getHttpServer())
        .post(`${pathWithValidParamsFixture}?${validQueryStringFixture}`)
        .send(validBodyFixture);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        body: validBodyFixture,
        params: validParamsFixture,
        query: validQueryFixture,
      });
    });

    it('responds with 400 when params are invalid', async () => {
      const response = await request(app.getHttpServer())
        .post(`/test/incorrect?${validQueryStringFixture}`)
        .send(validBodyFixture);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: 'INVALID_PATH_PARAMETER',
      });
    });
  });

  describe('query params', () => {
    it('lets a valid query pass through', async () => {
      const response = await request(app.getHttpServer())
        .post(`${pathWithValidParamsFixture}?${validQueryStringFixture}`)
        .send(validBodyFixture);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        body: validBodyFixture,
        params: validParamsFixture,
        query: validQueryFixture,
      });
    });

    it('handles optional query params', async () => {
      const optionalQueryFixture = {
        required: 'hihi',
      };
      const response = await request(app.getHttpServer())
        .post(
          `${pathWithValidParamsFixture}?${new URLSearchParams(
            optionalQueryFixture
          ).toString()}`
        )
        .send(validBodyFixture);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        body: validBodyFixture,
        params: validParamsFixture,
        query: optionalQueryFixture,
      });
    });

    it('responds with 400 when query is invalid', async () => {
      const invalidQueryFixture = {
        something: 'hihi',
      };
      const response = await request(app.getHttpServer())
        .post(`${pathWithValidParamsFixture}?${invalidQueryFixture}`)
        .send({
          notName: 'Some other guy',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: 'INVALID_QUERY_PARAMETER',
      });
    });
  });
});
