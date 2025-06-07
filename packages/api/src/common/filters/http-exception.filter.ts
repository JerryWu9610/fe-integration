import { ExceptionFilter, Catch, ArgumentsHost, HttpException, UnauthorizedException, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { CommonResponse } from '@common/interfaces/response.interface';
import { ErrorCode } from '@common/consts/error-codes';

const ERROR_CODE_MAP = new Map<Function, ErrorCode>([
  [UnauthorizedException, ErrorCode.AUTH_ERROR],
  [ForbiddenException, ErrorCode.FORBIDDEN],
  [NotFoundException, ErrorCode.NOT_FOUND],
  [BadRequestException, ErrorCode.INVALID_PARAMS],
]);

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    let message = exceptionResponse.message || exception.message;
    if (Array.isArray(message)) {
      message = message.join(', ');
    }

    const errorCode = ERROR_CODE_MAP.get(exception.constructor) || status.toString();

    const errorResponse: CommonResponse = {
      code: errorCode,
      message,
    };

    response.status(status).json(errorResponse);
  }
} 