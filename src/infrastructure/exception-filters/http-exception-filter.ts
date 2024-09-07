import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { getCurrentISOStringDate } from '@utils/dates';
import { InterlayerNoticeExtension } from '@base/models/Interlayer';

export type ErrorResponse = {
  errorsMessages: InterlayerNoticeExtension[];
};

// https://docs.nestjs.com/exception-filters
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === HttpStatus.BAD_REQUEST) {
      const errorsResponse: ErrorResponse = {
        errorsMessages: [],
      };

      const responseBody: any = exception.getResponse();

      if (Array.isArray(responseBody.message)) {
        responseBody.message.forEach((e) => {
          errorsResponse.errorsMessages.push(
            new InterlayerNoticeExtension(e.message, e.key),
          );
        });
      } else if (typeof responseBody === 'object') {
        errorsResponse.errorsMessages.push(
          new InterlayerNoticeExtension(responseBody.message, responseBody.key),
        );
      } else {
        errorsResponse.errorsMessages.push(responseBody.message);
      }

      response.status(status).json(errorsResponse);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: getCurrentISOStringDate(),
        path: request.url,
      });
    }
  }
}
