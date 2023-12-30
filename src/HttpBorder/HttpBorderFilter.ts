import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  InvalidBodyError,
  InvalidPathParameterError,
  InvalidQueryParameterError,
} from './errors';

type HttpBorderError =
  | InvalidBodyError
  | InvalidPathParameterError
  | InvalidQueryParameterError;

@Catch(InvalidBodyError, InvalidPathParameterError, InvalidQueryParameterError)
export class HttpBorderFilter implements ExceptionFilter<HttpBorderError> {
  catch(exception: HttpBorderError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // if (exception.where === 'response') {
    //   response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    //     status: HttpStatus.INTERNAL_SERVER_ERROR,
    //     timestamp: new Date().toISOString(),
    //   });
    //   return;
    // }

    response.status(HttpStatus.BAD_REQUEST).json({
      code: exception.code,
      // message: `Bad request, invalid body`,
      // status: HttpStatus.BAD_REQUEST,
      // errors: exception.key
      //   ? { [exception.key]: exception.zodError.format() }
      //   : exception.zodError.format(),
      // timestamp: new Date().toISOString(),
    });
  }
}
