import {
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import { UserService } from '../modules/user/user.service';
import { SocketBaseClass } from './classes/socketbase.class';
import { ChatService } from '../modules/chat/chat.service';
import { GetMessageHistoryDto, MessageDto } from '../modules/chat/dto/request.dto';
import { ApiOK } from '../common/responses/api-response';
import * as async from 'async';
import * as _ from 'lodash'
import { RedisService } from '../redis/redis.service';
import moment from 'moment';
import { RoomMode, RoomType, SkipRuleType } from '../database/entities/mysql/room.entity';
import { AppConfig } from '../common/constants/app-config';

export interface RoomInfomation {
  id: number
  name: string
  hostId: number
  host: {}
  type: string
  isEnd: boolean
  createdAt: Date
  totalMember: number
  members: any[]
  code: string
  description?: string
  cover?: string
  listSong?: any[]
  skipRule: SkipRuleType
  mode: RoomMode
  nowPlaying?: {}
  online: number
  startTour?: Date
  songIndex?: number
  votes?: {}
  roundResult?: {}
  skip?: {}
  allsong?: any[]
  round?: number
  currentRoundExclude?: number[]
}

export enum SocketNotificationType {
  CHANGED_HOST = 'CHANGED_HOST',
  START_TOURNAMENT = 'START_TOURNAMENT',
  END_ROUND = 'END_ROUND',
  SHOW_ROUND_RESULT = 'SHOW_ROUND_RESULT',
  STOP_TOURNAMENT = 'STOP_TOURNAMENT',
}

export interface SocketNotification {
  message: string
  type: SocketNotificationType
  key: string[]
  extraInfo?: { [key: string]: any }
}

export interface TournamentMembers {
  currentRoundAttending: any[],
  nextRoundExclude: any[],
  currentRoundExclude: any[]
}

@WebSocketGateway({ namespace: '/live' })
export class SocketGateway extends SocketBaseClass {
  constructor(
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
    protected readonly userService: UserService,
    protected readonly chatService: ChatService,
    protected readonly redisService: RedisService
  ) {
    super(jwtService, configService, userService)
  }

  protected _socketMap = {};
  public _roomStatus = {};
  public _songPlaying = {};
  public _tournamentMembers = {}

  //done rewrite + check
  @SubscribeMessage('sendMessage')
  public async handleMessage(client: Socket, payload: MessageDto) {
    let user = client['user']
    if (!user) {
      client.emit('errorLogger', { event: 'sendMessage', message: 'User not validated!' })
      this.logger.error(`***onSendMessage*** exception: User not found`)
      return;
    }
    async.auto({
      sendMessage: async (cb) => {
        const info = await this.chatService.sendMessage(user.id, payload)
        if (info) {
          cb(null, info)
          return
        }
        cb({ user: user.id, error: 'Send message fail' })
        return
      },
    }, async (e, result) => {
      if (e) {
        client.emit('errorLogger', { event: 'sendMessage', message: e.error, userId: e.userId, roomId: e.roomId })
        return this.logger.error(`***onSendMessage*** exception: userId ${e.userId} - roomId: ${e.roomId}: ${e.error}`);
      }
      this.server.to(this._socketMap[payload.receiverId]).emit('getMessage', new ApiOK(result.sendMessage));
      this.server.to(this._socketMap[client['user'].id]).emit('getMessage', new ApiOK(result.sendMessage));

    })
  }

  public async handleConnection(client: Socket): Promise<void> {
    await super.handleConnection(client)
    if (!client['user'] || !client['user']['id']) {
      this.logger.error('_onConnection invalid connected userid: socketId=' + client.id);
      return;
    }

    this._socketMap[client['user'].id] = client.id;
  }

  public async handleDisconnect(client: Socket): Promise<void> {
    const user = client['user']
    const room = client['currentRoomId'] ? client['currentRoomId'] : null
    super.handleDisconnect(client)
    let roomInfo
    try {
      if (room && user) {
      }
      if (!roomInfo) return this.logger.error(`***onDisconnected*** error: userId=${user ? user.id : null} room not found`);
      const online = this.server.adapter.rooms[room] ? this.server.adapter.rooms[room].length : null;
      if (!online || online === 0) {
        this.redisService.del(`room-${roomInfo.id}`)
        delete (this._songPlaying[room])
        if (this._tournamentMembers[room]) delete (this._tournamentMembers[room])
        return
      }
      const mode = this._roomStatus[room] ? this._roomStatus[room].mode : null;
      let info = Object.assign({}, roomInfo, { mode: mode, online: online })
      this.server.to(room).emit('updateRoomInfo', new ApiOK(info))
      this.redisService.set(`room-${room}`, this._roomStatus[room])
    } catch (e) {
      // client.emit('errorLogger', { room: room, user: user.id, error: e })
      return this.logger.error(`***onDisconnected*** error: userId=${user ? user.id : null} roomId=${room ? room : null} ${e.message}`);
    }
    delete (this._socketMap[client['user']['id']]);
  }
}