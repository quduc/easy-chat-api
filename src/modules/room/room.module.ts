import { HttpModule, Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from '../../database/entities/mysql/room.entity';
import { UserModule } from '../user/user.module';
import { RoomMember } from '../../database/entities/mysql/room_member.entity';
import { Invitation } from '../../database/entities/mysql/invitation.entity';
import { NotificationModule } from '../notification/notification.module';
import { InvitationController } from './invitation.controller';
import { HostController } from './host.controller';
import { Friend } from '../../database/entities/mysql/friend.entity';
import { S3Module } from '../../s3/s3.module';
import { Notification } from '../../database/entities/mysql/notification.entity';
import { RedisModule } from '../../redis/redis.module';

@Module({
  controllers: [RoomController, InvitationController, HostController],
  providers: [RoomService],
  exports: [RoomService],
  imports: [
    TypeOrmModule.forFeature([Notification, Room, RoomMember, Invitation, Friend]),
    UserModule,
    NotificationModule,
    S3Module,
    RedisModule,
    HttpModule
  ]
})
export class RoomModule { }
