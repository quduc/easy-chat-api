import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, UnauthorizedException, Logger } from "@nestjs/common";
import { ApiError } from "../responses/api-error";
import { ErrorDto } from "../responses/error-exception";
import * as util from 'util'

@Catch(HttpException)
export class ApiErrorFilter implements ExceptionFilter {
  constructor() { }
  private logger = new Logger('HTTP_ERROR');

  async catch(exception: HttpException | ApiError | BadRequestException | UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();
    let statusCode = 500;
    const errorDto = new ErrorDto();

    if (exception instanceof ApiError) {
      statusCode = exception.getStatus();
      errorDto.meta = exception.meta;
    } else if (exception instanceof UnauthorizedException) {
      statusCode = exception.getStatus();
      errorDto.message = exception.message;
      errorDto.statusCode = statusCode
    } else if (exception instanceof BadRequestException) {
      statusCode = exception.getStatus();
      errorDto.meta = exception.getResponse()
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      errorDto.statusCode = statusCode
      errorDto.meta = exception.getResponse();
    }
    this.logger.error(util.inspect(errorDto.meta || errorDto))
    response.status(statusCode).json(errorDto);
  }
}
