import { Timestamp } from "typeorm"
import { Room, RoomMode, RoomType, SkipRuleType } from "../../../database/entities/mysql/room.entity"
import { User } from "../../../database/entities/mysql/user.entity"
import * as _ from 'lodash'
export class RoomInfoDto {
  id: number
  name: string
  number: number
  type: RoomType
  hostId: number
  host?: User
  isEnd: boolean
  createdAt: Date
  totalMember: number
  members: User[]
  description: string
  code: string
  cover: string
  skipRule: SkipRuleType
  listSong: any[]
  nowPlaying?: {}
  mode: RoomMode
  online?: number
  allSong?: any[]
  votes?: {}
  roundResult?: {}
  skip?: {}
  round?: number

  constructor(entity: Room, socketInfo?, total?, members?, listSong?, nowPlaying?, playlistSong?) {
    this.id = entity.id
    this.name = entity.name
    this.hostId = entity.hostId
    if (entity.host && !_.isEmpty(entity.host)) {
      delete (entity.host.password)
      delete (entity.host.email)
      delete (entity.host.isFbConnect)
      delete (entity.host.updatedAt)
      this.host = entity.host
    }
    this.type = entity.type
    this.isEnd = entity.isEnd
    this.createdAt = entity.createdAt
    this.totalMember = total
    this.members = members
    this.code = entity.code
    this.description = entity.description
    this.cover = entity.cover
    this.listSong = listSong
    this.skipRule = entity.skipRule
    this.nowPlaying = nowPlaying
    this.mode = entity.mode
    this.number = entity.number
    this.online = socketInfo ? socketInfo.online : null
    this.allSong = playlistSong
    this.votes = socketInfo ? socketInfo.votes : {}
    this.roundResult = socketInfo ? socketInfo.roundResult : null
    this.skip = socketInfo ? socketInfo.skip : {}
    this.round = socketInfo ? socketInfo.round : 0
  }
}