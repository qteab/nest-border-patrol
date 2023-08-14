import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { z } from "zod";
import { createBorder, InferQuery, InferResponse, UseBorder } from "../../";

export const Border = createBorder({
  query: {
    required: z.string(),
    optional: z.string().optional(),
    nullable: z
      .object({
        prop: z.literal("value"),
      })
      .nullable(),
  },
});

@Controller({ path: "test" })
export class SampleController {
  @Get("/")
  @UseBorder(Border)
  public async get(
    @Query() query: InferQuery<typeof Border>
  ): Promise<InferResponse<typeof Border>> {
    return {};
  }
}
