import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  INestApplication,
  Post,
} from '@nestjs/common';
import { UseHttpBorder } from '../UseHttpBorder';
import { HttpBorder } from '../HttpBorder';
import { z } from 'zod';
import { BorderPatrolModule } from '~/border-patrol.module';
import { Test } from '@nestjs/testing';
import request from 'supertest';

const border = new HttpBorder({
  responses: {
    [HttpStatus.OK]: z.object({
      status: z.literal('OK'),
    }),
    [HttpStatus.CREATED]: z.object({
      status: z.literal('OK'),
    }),
  },
});

@Controller({
  path: 'test',
})
class TestController {
  @Get('/plain-valid')
  @UseHttpBorder(border)
  public plainValid() {
    return {
      status: 'OK',
      notInSchema: 'hihi',
    };
  }

  @Get('/plain-invalid-response-status-code')
  @UseHttpBorder(border)
  @HttpCode(HttpStatus.NOT_FOUND)
  public plainInvalidResponseStatusCode() {
    return {
      status: 'OK',
    };
  }

  @Get('/plain-invalid-response-body')
  @UseHttpBorder(border)
  public plainInvalidResponseBody() {
    return {
      status: 'NOT_OK',
    };
  }

  @Get('/border-valid')
  @UseHttpBorder(border)
  public borderValid() {
    return border.createResponse(HttpStatus.OK, { status: 'OK' });
  }

  @Get('/border-default-status-code-override')
  @UseHttpBorder(border)
  public borderDefaultStatusCodeOverride() {
    return border.createResponse(HttpStatus.CREATED, { status: 'OK' });
  }

  @Get('/border-status-code-override')
  @HttpCode(HttpStatus.NOT_FOUND)
  @UseHttpBorder(border)
  public borderStatusCodeOverride() {
    return border.createResponse(HttpStatus.CREATED, { status: 'OK' });
  }

  @Get('/border-invalid-response-status-code')
  @UseHttpBorder(border)
  public borderInvalidResponseStatusCode() {
    return border.createResponse(HttpStatus.NOT_FOUND as any, { status: 'OK' });
  }

  @Get('/border-invalid-response-body')
  @UseHttpBorder(border)
  public borderInvalidResponseBody() {
    return border.createResponse(HttpStatus.CREATED, {
      status: 'NOT_OK',
    } as any);
  }
}

describe('UseHttpBorder response validation', () => {
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

  describe('Plain response objects', () => {
    it('lets a valid response pass through', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/plain-valid')
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'OK',
      });
    });

    it('throws on invalid response status code', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/plain-invalid-response-status-code')
        .send();

      expect(response.status).toBe(500);
    });

    it('throws on invalid response body', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/plain-invalid-response-body')
        .send();

      expect(response.status).toBe(500);
    });
  });

  describe('BorderResponse objects', () => {
    it('lets a valid response pass through', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/border-valid')
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'OK',
      });
    });

    it('overrides nest default status codes', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/border-default-status-code-override')
        .send();

      expect(response.status).toBe(201);
    });

    it('overrides HttpCode decorator', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/border-status-code-override')
        .send();

      expect(response.status).toBe(201);
    });

    it('throws on invalid response status code', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/border-invalid-response-status-code')
        .send();

      expect(response.status).toBe(500);
    });

    it('throws on invalid response body', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/border-invalid-response-status-code')
        .send();

      expect(response.status).toBe(500);
    });
  });
});
