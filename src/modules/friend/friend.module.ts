import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from '../../database/entities/mysql/friend.entity';
import { Notification } from '../../database/entities/mysql/notification.entity';
import { User } from '../../database/entities/mysql/user.entity';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';

@Module({
  controllers: [FriendController],
  providers: [FriendService],
  imports: [
    UserModule,
    NotificationModule,
    TypeOrmModule.forFeature([User, Friend, Notification])
  ],
  exports: [FriendService]
})
export class FriendModule { }
