import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from '../../database/entities/mysql/conversation.entity';
import { Room } from '../../database/entities/mysql/room.entity';
import { RoomMember } from '../../database/entities/mysql/room_member.entity';
import { User } from '../../database/entities/mysql/user.entity';
import { UserModule } from '../user/user.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
  imports: [
    UserModule,
    TypeOrmModule.forFeature([RoomMember, Conversation, Room, User, Conversation])
  ]
})
export class ChatModule { }
