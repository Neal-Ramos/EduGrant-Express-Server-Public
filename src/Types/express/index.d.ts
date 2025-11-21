declare namespace Express {
  export interface Request {
    tokenPayload: import('../../Types/adminAuthControllerTypes').TokenPayload;
  }
}
