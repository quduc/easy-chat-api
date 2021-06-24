import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from '../database/entities/mysql/room.entity';
import { RedisModule } from '../redis/redis.module';
import { SocketModule } from '../socket/socket.module';
import { SchedulesService } from './schedules.service';
import { NotificationModule } from '../modules/notification/notification.module';

@Module({
  providers: [SchedulesService],
  exports: [SchedulesService],
  imports: [
    TypeOrmModule.forFeature([Room]),
    SocketModule,
    RedisModule,
    NotificationModule
  ]
})
export class SchedulesModule { }
