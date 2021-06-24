import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import moment from 'moment';
import { AppConfig } from '../common/constants/app-config';
import { ApiOK } from '../common/responses/api-response';
import { RoomMode } from '../database/entities/mysql/room.entity';
import { SocketGateway } from '../socket/socket.gateway';
import * as _ from 'lodash'
import { RedisService } from '../redis/redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

@Injectable()
export class SchedulesService {
  constructor(
    private readonly socket: SocketGateway,
    private readonly redisService: RedisService,
  ) { }

  @Cron(AppConfig.TOURNAMENT_SETTING.CHECK_NEXTSONG_PLAYING)
  public async playSongInRoom() {
  }

  @Cron(AppConfig.TOURNAMENT_SETTING.CHECK_TOURNAMENT_STATE)
  public async checkTournamentState() {
  }

  @Cron('* * */2 * * *')
  public async deleteMusicFileInRoom() {
  }

  @Cron('* * */2 * * *')
  public async deleteMusicFileUsers() {
  }
}
