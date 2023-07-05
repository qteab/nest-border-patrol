import { ZodError } from "zod";

export class BorderPatrolException extends Error {
  constructor(
    public readonly where: "response" | "query" | "body" | "params",
    public readonly zodError: ZodError,
    public readonly key?: string
  ) {
    super(`Invalid ${where}`);
  }
}
