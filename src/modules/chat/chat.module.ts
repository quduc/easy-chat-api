import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from '../../database/entities/mysql/conversation.entity';
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
    TypeOrmModule.forFeature([Conversation, User, Conversation])
  ]
})
export class ChatModule { }
