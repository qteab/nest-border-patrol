import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { z } from "zod";
import {
  createBorder,
  InferBody,
  InferParams,
  InferQuery,
  InferResponse,
  UseBorder,
} from "../../";

export const PostBorder = createBorder({
  body: z.object({
    name: z.string(),
  }),
  query: {
    required: z.string(),
    optional: z.string().optional(),
  },
  params: {
    someParam: z.literal("correct"),
  },
  responses: [
    {
      name: "Some response",
      status: 201,
      body: z.object({
        publicData: z.string(),
      }),
    }
  ]
});

@Controller({ path: "test" })
export class SampleController {
  @Post("/:someParam")
  @UseBorder(PostBorder)
  public async post(
    @Body() body: InferBody<typeof PostBorder>,
    @Query() query: InferQuery<typeof PostBorder>,
    @Param() params: InferParams<typeof PostBorder>
  ): Promise<InferResponse<typeof PostBorder>> {
    return {
      publicData: "Hello world",
      shouldNotBeInResponse: "bingbang",
    } as any;
  }

  @Get("/")
  @UseBorder(PostBorder)
  public async get(): Promise<InferResponse<typeof PostBorder>> {
    return {} as any;
  }
}
