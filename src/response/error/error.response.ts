import { HttpException } from '@nestjs/common';
import HttpStatus from '../../ultils/httpStatusCode/index';

class ErrorResponse extends HttpException {
  constructor(message: string, status: number) {
    super(message, status);
  }
}

export class ConfilctRequest extends ErrorResponse {
  constructor(message: string = HttpStatus.ReasonPhrases.CONFLICT) {
    super(message, HttpStatus.StatusCodes.CONFLICT);
  }
}

export class BadRequest extends ErrorResponse {
  constructor(message: string = HttpStatus.ReasonPhrases.BAD_REQUEST) {
    super(message, HttpStatus.StatusCodes.BAD_REQUEST);
  }
}

export class NotFound extends ErrorResponse {
  constructor(messsage: string = HttpStatus.ReasonPhrases.NOT_FOUND) {
    super(messsage, HttpStatus.StatusCodes.NOT_FOUND);
  }
}

export class Fobidden extends ErrorResponse {
  constructor(messsage: string = HttpStatus.ReasonPhrases.FORBIDDEN) {
    super(messsage, HttpStatus.StatusCodes.FORBIDDEN);
  }
}

export class InternalServerError extends ErrorResponse {
  constructor(
    message: string = HttpStatus.ReasonPhrases.INTERNAL_SERVER_ERROR,
  ) {
    super(message, HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR);
  }
}
