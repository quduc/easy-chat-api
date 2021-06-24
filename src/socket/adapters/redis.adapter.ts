import { INestApplicationContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as redisIoAdapter from 'socket.io-redis';

export class RedisIoAdapter extends IoAdapter {
  private readonly jwtService: JwtService;
  // constructor(private app: INestApplicationContext) {
  //   super(app);
  //   this.jwtService = this.app.get(JwtService);
  // }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port);
    options.allowRequest = async (request, allowFunction) => {
      console.log(request.params)
    }
    const redisAdapter = redisIoAdapter(
      {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      });
    server.adapter(redisAdapter);
    return server;
  }
}