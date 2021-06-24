import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as util from 'util'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private logger = new Logger('HTTP');

    use(request: Request, response: Response, next: NextFunction): void {
        response.on('finish', () => {
            this.logger.log(util.format(
                '%s %s \n# User: %j \n# Params: %j \n# IP: %s',
                request['method'],
                request['url'],
                request['user'] ? request['user']['id'] : 0,
                request['body'],
                request['ip']
            ))
        });

        next();
    }
}