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
  }

  //done rewrite + check
  @SubscribeMessage('joinRoom')
  public async onRoomChange(client: Socket, room: string): Promise<void> {
  }

  //done rewrite + check
  @SubscribeMessage('leaveRoom')
  public async onLeaveRoom(client: Socket, room: string): Promise<void> {
  }

  //done rewrite
  @SubscribeMessage('getHistoryChat')
  public async getHistoryChat(client: Socket, payload: GetMessageHistoryDto): Promise<void> {
  }

  //done rewrite
  @SubscribeMessage('kickMembers')
  public async kickMembers(client: Socket, payload): Promise<void> {
  }

  //NEED REWRITE!!!!!!
  @SubscribeMessage('changeRoomMode')
  public async changeStatusRoom(client: Socket): Promise<void> {

  }

  @SubscribeMessage('suggestSong')
  public async suggestSong(client: Socket, payload): Promise<void> {
  }

  @SubscribeMessage('voteSong')
  public async vote(client: Socket, payload): Promise<void> {
  }




  public async handleConnection(client: Socket): Promise<void> {
  }

  public async handleDisconnect(client: Socket): Promise<void> {
  }

  public async endTournamentUpdate(room, autoStart?: boolean) {

  }

  public async playNextSongImmediately(room: number, status?, evt?: string, sendUpdate?: boolean) {
  }

  public async setSongPlayingInQueue(room: number, listSong?: any[], allSong?: any[]) {

  }
}