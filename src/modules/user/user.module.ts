import { Global, HttpModule, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/mysql/user.entity';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../../redis/redis.module';
import { UserDevice } from '../../database/entities/mysql/user-device.entity';
import { S3Module } from '../../s3/s3.module';
import { Room } from '../../database/entities/mysql/room.entity';
import { Friend } from '../../database/entities/mysql/friend.entity';
import { UserNotification } from '../../database/entities/mysql/user_notification.entity';

@Global()
@Module({
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
  imports: [
    TypeOrmModule.forFeature([User, UserDevice, Room, Friend, UserNotification]),
    AuthModule,
    RedisModule,
    HttpModule,
    S3Module
  ],
})
export class UserModule { }
