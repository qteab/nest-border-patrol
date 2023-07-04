import { ZodError } from "zod";

export class BorderPatrolException extends Error {
  constructor(
    public readonly where: "response" | "query" | "body" | "params",
    public readonly zodError: ZodError
  ) {
    super(`Invalid ${where}`);
  }
}
