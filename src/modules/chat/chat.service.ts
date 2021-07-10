import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { Repository } from 'typeorm';
import { ApiError } from '../../common/responses/api-error';
import { Conversation } from '../../database/entities/mysql/conversation.entity';
import { GetMessageDto, GetMessageHistoryDto, MessageDto } from './dto/request.dto';
import { DetailMessageDto } from './dto/response.dto';
import * as _ from 'lodash'
import { ApiOK } from '../../common/responses/api-response';
import { User } from '../../database/entities/mysql/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) { }

  async sendMessage(userId: number, body: MessageDto) {
    const message = await this.conversationRepository.create({
      content: body.content,
      senderId: userId,
      receiverId: body.receiverId ? body.receiverId : null
    })
    await this.conversationRepository.save(message)
    const messId = message.id
    const result = await this.getDetailMessage(messId)
    return result
  }

  async getHistory(userId: number, body: GetMessageHistoryDto) {
    try {
      const limit = body.limit ? body.limit : 10
      const query = this.conversationRepository.createQueryBuilder('c')
        .leftJoinAndSelect('c.sender', 'sender')
        .andWhere(`(c.senderId = ${userId} AND c.receiverId = ${body.receiverId}) OR (c.senderId = ${body.receiverId} AND c.receiverId = ${userId})`)

      if (body.lastId) {
        query.andWhere(`c.id < :lastId`, { lastId: body.lastId })
      }
      const history = await query
        .orderBy('c.createdAt', 'DESC')
        .limit(limit)
        .getMany()

      const result = _.reduce(history, (data, item) => {
        let tmp = new DetailMessageDto(item)
        data.push(tmp)
        return data
      }, [])
      return new ApiOK(_.reverse(result))
    } catch (error) {
      throw new ApiError('SYSTEM_ERROR', 'System error', error)
    }
  }

  async getDetailMessage(id: number) {
    try {
      const message = await this.conversationRepository.createQueryBuilder('c')
        .leftJoinAndSelect('c.sender', 'sender')
        .where('c.id = :id', { id: id })
        .getOne();

      return new DetailMessageDto(message)
    } catch (e) {
      throw new ApiError('SYSTEM_ERROR', 'System error', e)
    }
  }

  async getMessage(userId: number, data: GetMessageDto) {
    const limit = data?.limit || 10
    const offset = data.offset || 0
    try {
      const query = this.userRepository.createQueryBuilder('user')
        .select('user.id', 'id')
        .distinct(true)
        .addSelect('user.avatar', 'avatar')
        .addSelect('user.name', 'name')
        .innerJoin('conversation', 'conversation', '(conversation.receiverId = user.id) OR (conversation.senderId = user.id)')
        .where(`(conversation.senderId = ${userId}) OR (conversation.receiverId = ${userId})`)

      const total = await query.getCount()

      const result = await query
        .offset(offset)
        .limit(limit)
        .getRawMany()

      const newResult = _.filter(result, (item) => { return item.id != userId })

      return { items: newResult, total: total }
    } catch (e) {
      throw new ApiError('SYSTEM_ERROR', 'System error', e)
    }
  }
}
