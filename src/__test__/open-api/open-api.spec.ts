import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { SampleController } from "./open-api.controller";
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from "@nestjs/swagger";
import { ParameterObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

describe("Open API generation", () => {
  let app: INestApplication;
  let swaggerDocument: OpenAPIObject;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      controllers: [SampleController],
    }).compile();

    app = module.createNestApplication();
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Nest Border Patrole Test API")
      .setDescription("Nest Border Patrole Test API")
      .setVersion("1.0")
      .build();
    swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("handles optionals and required query params", async () => {
    expect(true).toBe(true);
    const parameters = swaggerDocument.paths["/test"]?.get?.parameters;

    console.log(parameters);
    if (!parameters) {
      throw new Error("Parameters not set");
    }
    const requiredParameter = parameters.find(
      (parameter): parameter is ParameterObject =>
        "name" in parameter && parameter.name === "required"
    );
    if (!requiredParameter) {
      throw new Error("Could not find a parameter with name 'required'");
    }
    expect(requiredParameter.required).toBe(true);
    const optionalParameter = parameters.find(
      (parameter): parameter is ParameterObject =>
        "name" in parameter && parameter.name === "optional"
    );
    if (!optionalParameter) {
      throw new Error("Could not find a parameter with name 'optional'");
    }
    expect(optionalParameter.required).toBe(false);
  });
});
