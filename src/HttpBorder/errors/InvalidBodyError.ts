import { HttpBorder } from '../HttpBorder';

export class InvalidBodyError extends Error {
  public readonly code = 'INVALID_BODY';
  // border: HttpBorder<any, any, any, any>, erro
  constructor() {
    super('Invalid body');
  }
}
