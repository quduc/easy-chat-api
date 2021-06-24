import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../../database/entities/mysql/notification.entity';
import { UserDevice } from '../../database/entities/mysql/user-device.entity';
import { SocketModule } from '../../socket/socket.module';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService],
  imports: [
    UserModule,
    TypeOrmModule.forFeature([Notification, UserDevice]),
    SocketModule
  ],
  exports: [NotificationService]
})
export class NotificationModule { }
