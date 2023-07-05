import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { BorderPatrolException } from "./border-patrol.exception";
import type { Request, Response } from "express";

@Catch(BorderPatrolException)
export class BorderPatrolExceptionFilter
  implements ExceptionFilter<BorderPatrolException>
{
  catch(exception: BorderPatrolException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception.where === "response") {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    response.status(HttpStatus.BAD_REQUEST).json({
      message: `Bad request, invalid ${exception.where}`,
      status: HttpStatus.BAD_REQUEST,
      errors: exception.key
        ? { [exception.key]: exception.zodError.format() }
        : exception.zodError.format(),
      timestamp: new Date().toISOString(),
    });
  }
}
