import { HttpBorder } from '../HttpBorder';

export class InvalidPathParameterError extends Error {
  public readonly code = 'INVALID_PATH_PARAMETER';
  // border: HttpBorder<any, any, any, any>, erro
  constructor() {
    super('Invalid params');
  }
}
