import { Response } from 'express';
import HttpStatus from '../../ultils/httpStatusCode/index';

abstract class SuccessResponse<T> {
  message: string;
  status: number;
  metaData: T;

  constructor(message: string, status: number, metaData: T = null) {
    this.message = message;
    this.status = status;
    this.metaData = metaData;
  }

  public sender(res: Response) {
    return res.status(this.status).json(this.metaData);
  }
}

export class Ok<T> extends SuccessResponse<T> {
  constructor(
    metaData: T = null,
    message: string = HttpStatus.ReasonPhrases.OK,
  ) {
    super(message, HttpStatus.StatusCodes.OK, metaData);
  }
}

export class Created<T> extends SuccessResponse<T> {
  constructor(
    metaData: T = null,
    message: string = HttpStatus.ReasonPhrases.CREATED,
  ) {
    super(message, HttpStatus.StatusCodes.CREATED, metaData);
  }
}
