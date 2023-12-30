import { HttpStatus } from '@nestjs/common';
import { z } from 'zod';

export class HttpBorderResponse<TStatusCode extends HttpStatus, TBody> {
  public readonly statusCode: TStatusCode;
  public readonly body: TBody;
  constructor(options: { statusCode: TStatusCode; body: TBody }) {
    this.statusCode = options.statusCode;
    this.body = options.body;
  }
}
