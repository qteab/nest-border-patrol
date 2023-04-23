import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { SampleController } from "./validation.controller";

const validBody = {
  name: "hihi",
};
const validParams = {
  someParam: "correct",
};

describe("GET /v1/games", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      controllers: [SampleController],
    }).compile();

    app = module.createNestApplication();

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("responds with 201 with a valid request", async () => {
    const response = await request(app.getHttpServer())
      .post(
        `/test/${validParams.someParam}?${new URLSearchParams({
          required: "hihi",
          optional: "hoho",
        })}`
      )
      .send(validBody);
    expect(response.status).toBe(201);
  });

  it("responds with 201 with optionals", async () => {
    const response = await request(app.getHttpServer())
      .post(
        `/test/${validParams.someParam}?${new URLSearchParams({
          required: "hihi",
        })}`
      )
      .send(validBody);
    expect(response.status).toBe(201);
  });

  it("responds with 400 when invalid params", async () => {
    const response = await request(app.getHttpServer())
      .post(
        `/test/${validParams.someParam}${new URLSearchParams({
          required: "hihi",
        })}`
      )
      .send(validBody);
    expect(response.status).toBe(400);
  });

  it("responds with 400 when invalid query params", async () => {
    const response = await request(app.getHttpServer())
      .post(`/test/${validParams.someParam}`)
      .send(validBody);
    expect(response.status).toBe(400);
  });

  it("responds with 400 when body is invalid", async () => {
    const response = await request(app.getHttpServer())
      .post(
        `/test/${validParams.someParam}${new URLSearchParams({
          required: "hihi",
        })}`
      )
      .send({});
    expect(response.status).toBe(400);
  });

  it("response is stripped", async () => {
    const response = await request(app.getHttpServer())
      .post(
        `/test/${validParams.someParam}?${new URLSearchParams({
          required: "hihi",
        })}`
      )
      .send(validBody);
    expect(response.status).toBe(201);
    expect(response.body).toStrictEqual({
      publicData: "Hello world",
    });
  });

  it("responds with 500 when data is missing from response", async () => {
    const response = await request(app.getHttpServer()).get(`/test/`);
    expect(response.status).toBe(500);
    console.log(response.body);
  });
});
