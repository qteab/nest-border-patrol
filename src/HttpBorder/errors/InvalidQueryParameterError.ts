import { HttpBorder } from '../HttpBorder';

export class InvalidQueryParameterError extends Error {
  public readonly code = 'INVALID_QUERY_PARAMETER';
  // border: HttpBorder<any, any, any, any>, erro
  constructor() {
    super('Invalid query');
  }
}
