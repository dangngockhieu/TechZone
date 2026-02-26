import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { AppException } from '../exception/app.exception';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof AppException) {
      return res.status(exception.statusCode).json({
        success: false,
        message: exception.message
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response: any = exception.getResponse();

      return res.status(status).json({
        success: false,
        message: response?.message || 'Error'
      });
    }

    console.error(exception);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
