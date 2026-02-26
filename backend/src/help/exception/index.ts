import { AppException } from './app.exception';


export class BadRequestException extends AppException {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

export class UnauthorizedException extends AppException {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class NotFoundException extends AppException {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

export class ForbiddenException extends AppException {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class ConflictException extends AppException {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

export class InternalServerErrorException extends AppException {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
  }
}