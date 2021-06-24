import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { Repository } from 'typeorm';
import { ApiError } from '../../common/responses/api-error';
import { Conversation } from '../../database/entities/mysql/conversation.entity';
import { RoomMember } from '../../database/entities/mysql/room_member.entity';
import { GetMessageHistoryDto, MessageDto } from './dto/request.dto';
import { DetailMessageDto } from './dto/response.dto';
import * as _ from 'lodash'
import { ApiOK } from '../../common/responses/api-response';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(RoomMember)
    private readonly roomMemberRepository: Repository<RoomMember>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) { }

  async joinRoom(userId: number, roomId: number) {
    try {
      const record = await this.roomMemberRepository.create({
        userId: userId,
        roomId: roomId
      })
      await this.roomMemberRepository.save(record)
      return true;
    } catch (e) {
      console.log(e)
      return false
    }
  }

  async sendMessage(userId: number, body: MessageDto) {
    const message = await this.conversationRepository.create({
      roomId: body.roomId,
      content: body.content,
      metadata: body.metadata ? body.metadata : null,
      senderId: userId,
      receiverId: body.receiverId ? body.receiverId : null
    })
    await this.conversationRepository.save(message)
    const messId = message.id
    const result = await this.getDetailMessage(messId)
    return result

    // } catch(e) {
    //   console.log(e)
    //   throw new ApiError('SYSTEM_ERROR', 'System error', e)

    // }
  }

  async getHistory(userId: number, body: GetMessageHistoryDto) {

  }

  async getDetailMessage(id: number) {
    try {
      const message = await this.conversationRepository.createQueryBuilder('c')
        .leftJoinAndSelect('c.sender', 'sender')
        .where('c.id = :id', { id: id })
        .andWhere('c.isDeleted = :status', { status: false })
        .getOne();

      return new DetailMessageDto(message)
    } catch (e) {
      throw new ApiError('SYSTEM_ERROR', 'System error', e)

    }
  }
}
