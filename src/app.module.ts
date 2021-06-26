import { PostModule } from './modules/post/post.module';
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { RedisModule } from './redis/redis.module';
import { PassportModule } from '@nestjs/passport';
import { SocketModule } from './socket/socket.module';
import { ChatModule } from './modules/chat/chat.module';
import "reflect-metadata"
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from './config/config.service';
import { NotificationModule } from './modules/notification/notification.module';
import { EmailModule } from './email/email.module';
import { FriendModule } from './modules/friend/friend.module';
import { S3Module } from './s3/s3.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LoggerMiddleware } from './common/middleware/LoggerMiddleware';
import { SchedulesModule } from './schedules/schedules.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    DatabaseModule,
    ConfigModule,
    RedisModule,
    PassportModule,
    SocketModule,
    ChatModule,
    PostModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.jwtConfig.secret,
        signOptions: {
          expiresIn: configService.jwtConfig.expiresIn
        },

      }),
    }),
    NotificationModule,
    EmailModule,
    FriendModule,
    S3Module,
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    SchedulesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}