# Nest Border Patrol

A package for validating NestJS HTTP controller endpoints using zod. Integrates with NestJS swagger.

## Getting started

Install the package:

```bash
npm i @qte/nest-border-patrol
```

```bash
yarn add @qte/nest-border-patrol
```

```bash
pnpm add @qte/nest-border-patrol
```

You also will need the following dependencies if you haven't installed them already

- @nestjs/common
- @nestjs/swagger
- rxjs
- zod

Import the `BorderPatrolModule` to your root module.

```typescript
import { BorderPatrolModule } from "@qte/nest-border-patrol";

@Module({
  imports: [
    BorderPatrolModule.forRootAsync({
      inject: [],
      useFactory: () => ({}),
    }),
  ],
})
class AppModule {}
```

## Usage

Create a `BorderConfiguration` using the `createBorder()` function. This function requires one argument with the following optional properties.

- `body` - Any Zod schema
- `params` - A string record of Zod schemas where the key is the name of your URL parameters
- `query` - A string record of Zod schemas
- `response` - Any zod schema

To make use of the newly created `BorderConfiguration` you decorate your controller endpoint with the `@UseBorder()` decorator. This will in turn validate the incoming request and outgoing response with the supplied schemas in the `BorderConfiguration`.

The `@UseBorder()` decorator will also decorate your controller method with matching `@nestjs/swagger` decorators for generating OpenAPI schemas.

### Example

```ts
import { Body, Controller, Param, Post, Query } from "@nestjs/common";
import { z } from "zod";
import {
  createBorder,
  InferBody,
  InferParams,
  InferQuery,
  InferResponse,
  UseBorder,
} from "@qte/nest-border-patrol";

// Create a border configuration
const PostBorder = createBorder({
  body: z.object({
    name: z.string(),
  }),
  query: {
    someQueryParam: z.string().optional(),
  },
  params: {
    someParam: z.string(),
  },
  response: z.object({
    publicData: z.string(),
  }),
});

@Controller()
export class SampleController {
  @Post("/:someParam")
  @UseBorder(PostBorder)
  public async post(
    // Will be typed as:
    //  { name: string }
    @Body() body: InferBody<typeof PostBorder>,
    // Will be typed as:
    // { someQueryParam: string | undefined; }
    @Query() query: InferQuery<typeof PostBorder>,
    // Will be typed as:
    // { someParam: string; }
    @Param() params: InferParams<typeof PostBorder>
  ): // Will be typed as:
  // { publicData: string; }
  Promise<InferResponse<typeof PostBorder>> {
    return {
      publicData: "Hello world",
      // This property will stripped from the response as
      // it is not defined in the response schema.
      sensitiveData: "password",
    };
  }
}
```

## Versioning

Until the package reaches 1.0.0 all updates may be breaking.

## Potential roadmap

- Validating headers incoming and outgoing
- OpenAPI example values
- Test typings using `// @ts-expect-error`
- Validate query params as an object (OpenAPI issues)
- Validate unnamed query params
-
