import { HttpService, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { createQueryBuilder, In, Not, Repository } from 'typeorm';
import { ApiError } from '../../common/responses/api-error';
import { ApiOK } from '../../common/responses/api-response';
import { Room, RoomMode, RoomType } from '../../database/entities/mysql/room.entity';
import { RoomMember } from '../../database/entities/mysql/room_member.entity';
import { UserService } from '../user/user.service';
import { CreateRoomDto, GetHostListDto, GetListRoomDto, HostListType, InviteSingleUserDto, InviteUserDto, KickMemberDto, SuggestSongDto, UpdateRoomInfoDto, VoteSongDto, GetJoinedRoomDto, VoteSongFromSocketDto } from './dto/request.dto';
import * as _ from 'lodash'
import { RoomInfoDto } from './dto/response.dto';
import { Invitation, InvitationStatus } from '../../database/entities/mysql/invitation.entity';
import { NotificationService } from '../notification/notification.service';
import { SuggestSongInRoomDto } from './dto/suggest.dto';
import { Friend, FriendStatus } from '../../database/entities/mysql/friend.entity';
import { S3Service } from '../../s3/s3.service';
import { Notification, NotificationType } from '../../database/entities/mysql/notification.entity';
import { RedisService } from '../../redis/redis.service';
import { UploadType } from '../../s3/dto/request.dto';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomMember)
    private readonly roomMemberRepository: Repository<RoomMember>,
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private readonly redisService: RedisService,
    private readonly fileService: S3Service,
    private readonly httpService: HttpService
  ) { }

  async getListRoom(userId: number, data: GetListRoomDto) {
    const offset = data.offset ? data.offset : 0
    const limit = data.limit ? data.limit : 10

    const query = this.roomMemberRepository.createQueryBuilder('members')
      .innerJoin('rooms', 'room', `room.id = members.roomId and members.isLeave = false`)
      .innerJoin('room.host', 'host')
      .select('room.id', 'id')
      .distinct(true)
      .addSelect('count(members.roomId)', 'total')
      .addSelect('room.name', 'name')
      .addSelect('room.code', 'code')
      .addSelect('room.number', 'number')
      .addSelect('room.description', 'description')
      .addSelect('room.cover', 'cover')
      .addSelect('host.id', 'hostId')
      .addSelect('host.name', 'hostName')
      .addSelect('host.avatar', 'hostAvatar')
      .addSelect('room.type', 'type')
      .where(`room.isEnd = false`)

    if (data.keyword) query.where(`(lower(room.name) like :name or lower(room.code) like :code)`, { name: `%${data.keyword}%`, code: `%${data.keyword}%` })
    if (data.type) query.andWhere(`room.type = :type`, { type: data.type })
    query.groupBy('room.id')

    const total = await query.getCount()
    const rooms = await query.limit(limit).offset(offset).orderBy('room.createdAt', 'DESC').getRawMany()
    if (_.isEmpty(rooms)) return new ApiOK({ items: [] })
    const songs = []
    const members = await this.getMembersOfRooms(rooms.map(value => parseInt(value.id)))
    const result = _.reduce(rooms, (data, item) => {
      let tmp = item
      tmp['nowPlaying'] = songs[item.id] ? songs[item.id] : null
      tmp['members'] = members[item.id] ? members[item.id] : null
      data.push(tmp)
      return data
    }, [])
    // console.log(result)
    return new ApiOK({ items: result, total: total })
  }

  async createRoom(userId: number, data: CreateRoomDto, file?) {
    const cacheUser = await this.userService.getUserInfoRedis(userId);
    let code = this.getRandomString(6).toUpperCase()
    let check = null
    do {
      check = await this.roomRepository.findOne({ code: code })
      if (check) code = this.getRandomString(6).toUpperCase()
    } while (check)
    let cover = data.cover
    // console.log(file)
    if (file) {
      const presignUrl = await this.fileService.generate(cacheUser.id, { name: file.originalname, type: UploadType.COVER })
      let buffer = file.buffer
      await this.httpService.put(presignUrl, buffer, {
        headers: { 'Content-Type': file.mimetype }
      }).toPromise()
      cover = this.fileService.getFullPath(presignUrl)
    }

    try {
      let roomInfo = await this.roomRepository.create({
        hostId: cacheUser.id,
        name: data.name,
        number: data.number,
        type: data.type,
        code: code,
        description: data.description,
        cover: cover,
        skipRule: data.skipRule
      })
      await this.roomRepository.save(roomInfo);
      const member = await this.roomMemberRepository.create({ roomId: roomInfo.id, userId: cacheUser.id })
      await this.roomMemberRepository.save(member)

      if (data.userIds) {
        this.inviteMembers(userId, roomInfo.id, { roomId: roomInfo.id, userIds: data.userIds })
      }

      roomInfo.host = cacheUser
      // roomInfo.cover = this.fileService.getFullPath(roomInfo.cover)
      const result = new RoomInfoDto(roomInfo)
      return new ApiOK(result)
    } catch (e) {
      console.log(e)
      throw new ApiError('SYSTEM_ERROR', 'System error', e)
    }
  }

  async getRoomInfo(roomId: number, userId: number) {
    let room = await this.roomRepository.createQueryBuilder('room')
      .leftJoinAndSelect('room.host', 'host')
      .where(`room.id = :id`, { id: roomId })
      .andWhere(`room.isEnd = :status`, { status: false })
      .getOne()
    if (!room) {
      return null
    }
    try {
      const totalMember = await this.roomMemberRepository //.findAndCount({ roomId: roomId, isLeave: false })
        .createQueryBuilder('rm')
        .innerJoin('rm.user', 'm')
        .leftJoin('friends', 'fr', 'fr.friendId = rm.userId and fr.userId = :userId', { userId: userId })
        .addSelect('m.id')
        .addSelect('m.name')
        .addSelect('m.avatar')
        .addSelect('fr.status')
        .addSelect('fr.isFollowed')
        .where(`rm.roomId = :roomId`, { roomId: roomId })
        .andWhere(`rm.isLeave = :status`, { status: false })
        .getCount()
      const host = {
        name: room.host.name,
        id: room.hostId,
        avatar: room.host.avatar
      }
      const members = await this.getRoomMembers(userId, roomId)
      const socketInfo = await this.redisService.get(`room-${roomId}`)
      const online = socketInfo ? socketInfo.online : 0
      const allsong = []
      const currentList = null
      const result = new RoomInfoDto(room, socketInfo, totalMember, members, currentList)
      return result
    } catch (e) {
      console.log(e)
      throw new ApiError('SYSTEM_ERROR', 'System error', e)
    }
  }

  async updateRoomInfo(userId: number, roomId: number, data: UpdateRoomInfoDto, file?) {

    const cacheUser = await this.userService.getUserInfoRedis(userId)

    const roomInfo = await this.roomRepository.createQueryBuilder('room')
      .leftJoinAndSelect('room.host', 'host')
      .where(`room.id = :roomId`, { roomId: roomId })
      .getOne()

    if (cacheUser.id !== roomInfo.hostId) {
      throw new ApiError('PERMISSION_DENIED', 'You are not host of this room')
    }
    if (file) {
      const presignUrl = await this.fileService.generate(cacheUser.id, { name: file.originalname, type: UploadType.COVER })
      let buffer = file.buffer
      await this.httpService.put(presignUrl, buffer, {
        headers: { 'Content-Type': file.mimetype }
      }).toPromise()
      data.cover = this.fileService.getFullPath(presignUrl)
    }
    const totalMember = await this.roomMemberRepository.count({ roomId: roomId })
    if (data.number < totalMember) {
      throw new ApiError('NUMBER_FIELD_INVALID', 'Current total room members is greater than config', { key: "value", value: "number" })
    }
    try {
      const newInfo = Object.assign({}, roomInfo, data)
      await this.roomRepository.save(newInfo)
      const result = await this.getRoomInfo(roomId, userId)
      return new ApiOK(result)
    } catch (e) {
      console.log(e)
      throw new ApiError('SYSTEM_ERROR', 'System error', e)
    }
  }

  async getRoomMembers(userId: number, roomId: number) {
    const room = await this.roomRepository.findOne(roomId)
    const members = await this.roomMemberRepository.createQueryBuilder('members')
      .innerJoin('members.user', 'user')
      .leftJoin('friends', 'requestStatus', `requestStatus.isDeleted = false and requestStatus.friendId = members.userId and requestStatus.userId = ${userId}`)
      .leftJoin('friends', 'receiveStatus', `receiveStatus.isDeleted = false and receiveStatus.userId = members.userId and receiveStatus.friendId = ${userId}`)
      .select('user.id', 'id')
      .addSelect('user.name', 'name')
      .addSelect('user.avatar', 'avatar')
      .addSelect('requestStatus.isFollowed', 'isFollowed')
      .addSelect('requestStatus.status', 'friendStatus')
      .addSelect(`case when receiveStatus.status = 'PENDING' then true else null end`, 'requestDisable')
      .where(`members.isLeave = false`)
      .andWhere(`members.roomId = :roomId`, { roomId: roomId })
      // .andWhere(`members.userId != :userId`, { userId: userId })
      .getRawMany()
    // console.log(members)
    return members
  }
  // done rewrite...
  async userLeaveRoom(userId: number, roomId: number, socket?: boolean) {
    const cacheUser = await this.userService.getUserInfoRedis(userId)
    let roomInfo = await this.getRoomInfo(roomId, userId)
    if (!roomInfo) {
      if (socket) return
      throw new ApiError('ROOM_NOT_FOUND', 'MSG_21')
    }

    let info = await this.roomMemberRepository.findOne({ userId: userId, roomId: roomId, isLeave: false })

    if (!info) {
      if (socket) return
      throw new ApiError('USER_NOT_IN_ROOM', 'User not in current room')
    }
    try {
      await this.roomMemberRepository.update({ roomId: roomId, userId: userId }, { isLeave: true })
      if (cacheUser.id === roomInfo.hostId) {
        // await this.roomMemberRepository.update({ roomId: roomId, isLeave: false }, { isLeave: true })
        // await this.roomRepository.update({ id: roomId }, { isEnd: true })
        const nextHost = await this.roomMemberRepository.createQueryBuilder('members')
          .innerJoinAndSelect('members.user', 'user')
          .where(`members.isLeave = false`)
          .andWhere(`members.roomId = :roomId`, { roomId: roomId })
          .andWhere(`members.userId <> :userId`, { userId: userId })
          .orderBy('members.updatedAt', 'ASC')
          .getOne()
        // console.log(nextHost)
        if (!nextHost) {
          // console.log(roomInfo.id)
          await this.roomRepository.update({ id: roomInfo.id }, { isEnd: true })
          roomInfo.isEnd = true
          return roomInfo
        } else {
          await this.roomRepository.update({ id: roomInfo.id }, { hostId: nextHost.userId })
        }
      }
      roomInfo = await this.getRoomInfo(roomId, userId)
      // console.log(roomInfo)
      return roomInfo
    } catch (e) {
      console.log(e)
      if (socket) return
      throw new ApiError('SYSTEM_ERROR', 'System error', e)
    }
  }

  //done rewrite
  async userJoinRoom(userId: number, roomId: number) {
    let roomInfo = await this.getRoomInfo(roomId, userId)

    if (!roomInfo) {
      return null
    }

    // try {
    let info = await this.roomMemberRepository.findOne({ userId: userId, roomId: roomId });
    const totalMember = await this.roomMemberRepository.count({ roomId: roomId, isLeave: false })
    // if (info && info.isLeave == false) {
    //   throw new ApiError('USER_IN_ROOM', 'User already in the room')
    // }

    if (roomInfo.number === totalMember && ((info && info.isLeave == true) || !info)) {
      throw new ApiError('ROOM_LIMITED', `MSG_10`)
    }

    if (roomInfo.type === RoomType.PRIVATE && ((info && info.isLeave == true) || !info)) {
      throw new ApiError('ROOM_LIMITED', `MSG_11`)
    }

    if (info && info.isLeave == true) {
      await this.roomMemberRepository.update({ roomId: info.roomId, userId: info.userId }, { isLeave: false, createdAt: moment().toISOString(), updatedAt: moment().toISOString() })
    }

    if (!info) {
      info = await this.roomMemberRepository.create({ userId: userId, roomId: roomId })
      await this.roomMemberRepository.save(info)
    }
    roomInfo = await this.getRoomInfo(roomId, userId)
    return roomInfo
    // } catch (e) {
    //   console.log(e)
    //   throw new ApiError('SYSTEM_ERROR', 'System error', e)

    // }
  }

  // rewriting...
  async kickMembers(userId: number, roomId: number, data: KickMemberDto, socket?: boolean) {
    const cacheUser = await this.userService.getUserInfoRedis(userId)
    // if (cacheUser.success === false) {
    //   // if (socket) return
    //   throw new ApiError(cacheUser.code, cacheUser.message)
    // }
    const room = await this.roomRepository.findOne({ id: roomId, hostId: userId, isEnd: false })
    // if (!room || room.isEnd) {
    //   // if (socket) return
    //   throw new ApiError('PERMISSION_DENIED', 'You donot have permission or room not found')
    // }
    // try {
    const userIds = _.uniq(data.userIds)
    const members = await this.roomMemberRepository.find({ select: ['userId'], where: { roomId: room.id, isLeave: false } })
    const memberIds = _.map(members, value => { return parseInt(value.userId) })
    const kickIds = memberIds ? _.compact(_.map(userIds, value => { if (memberIds.indexOf(value) !== -1) return value })) : null
    if (!_.isEmpty(kickIds)) {
      if (!socket)
        await this.roomMemberRepository.update({ userId: In(kickIds), roomId: roomId }, { isLeave: true })
    }
    return !_.isEmpty(kickIds) ? kickIds : null
    // } catch (e) {
    //   console.log(e)
    //   throw new ApiError('SYSTEM_ERROR', 'System error', e)
    // }
  }

  //done rewrite
  async inviteMembers(userId: number, roomId: number, data: InviteUserDto) {
    const cacheUser = await this.userService.getUserInfoRedis(userId)

    const roomMembers = await this.roomMemberRepository.find({ select: ['userId'], where: { roomId: roomId, isLeave: false } })
    const memberIds = _.map(roomMembers, value => value.userId)
    const pendingInvitations = await this.invitationRepository.find({ select: ['userId'], where: { roomId: roomId, status: InvitationStatus.PENDING, isDeleted: false } })
    const pMemberIds = _.uniq(_.map(pendingInvitations, value => value.userId))


    const roomInfo = await this.getRoomInfo(roomId, userId)
    if (!roomInfo) {
      throw new ApiError('ROOM_NOT_FOUND', 'MSG_21')
    }
    let newInvitations
    if (data.userIds) {
      const userIds = _.compact(_.uniq(_.map(data.userIds, value => {
        if (!memberIds.includes(value.toString()) && !pMemberIds.includes(value.toString()))
          return value
      })))
      // console.log(userIds)
      if (_.isEmpty(userIds)) {
        // throw new ApiError('INVALID_USER_IDS', 'Members invalid')
        return
      }

      const totalMembers = roomInfo.totalMember
      const number = roomInfo.number
      // if (totalMembers + userIds.length > number) {
      //   // throw new ApiError('INVALID_TOTAL_MEMBERS', 'Total members will be greater than room config')
      // }

      let newNotification = []
      const newInv = _.reduce(userIds, (data, item) => {
        let tmp = {
          roomId: roomId,
          userId: item,
          senderId: userId
        }
        data.push(tmp)
        return data
      }, [])

      newInvitations = await this.invitationRepository.create(newInv)
      await this.invitationRepository.save(newInvitations)
    }

    const newNotification = _.reduce(newInvitations, (data, item) => {
      // console.log(item)
      let metadata = {
        invitationId: item.id,
        roomId: roomId,
        roomName: `${roomInfo.name}`
      }
      let newNoti = {
        title: 'Invitation to room',
        body: `${roomInfo.name}`,
        userId: item.userId,
        senderId: userId,
        type: NotificationType.INVITED,
        metadata: JSON.stringify(metadata),
        refId: item.id
      }
      data.push(newNoti)
      return data
      // 
    }, [])
    this.notificationService.sendNotifications(userId, newNotification)
    return newInvitations
  }

  //invite single
  async inviteMember(userId: number, roomId: number, data: InviteSingleUserDto) {
    // const cacheUser = await this.userService.getUserInfoRedis(userId)
    const checkMember = await this.roomMemberRepository.findOne({ roomId: roomId, userId: data.userId })
    let checkInvite = await this.invitationRepository.findOne({ roomId: roomId, userId: data.userId, status: InvitationStatus.PENDING })

    if (checkMember && checkMember.isLeave === false) {
      console.log(checkMember)
      return
    }

    if (checkInvite && checkInvite.senderId !== userId && checkInvite.isDeleted === false) {
      return
    }

    if (checkInvite) {
      checkInvite.isDeleted = !checkInvite.isDeleted;
    }

    if (!checkInvite) {
      checkInvite = await this.invitationRepository.create({
        roomId: roomId,
        userId: data.userId,
        senderId: userId
      })
    }

    await this.invitationRepository.save(checkInvite)

    if (checkInvite.isDeleted === false) {
      const roomInfo = await this.getRoomInfo(roomId, userId)
      if (!roomInfo) throw new ApiError('ROOM_NOT_FOUND', 'MSG_21')
      let metadata = {
        invitationId: checkInvite.id
      }
      let newNoti = {
        title: 'Invitation to room',
        body: `${roomInfo.name}`,
        userId: data.userId,
        senderId: userId,
        type: NotificationType.INVITED,
        metadata: JSON.stringify(metadata),
        refId: checkInvite.id
      }
      this.notificationService.sendNotifications(userId, [newNoti])
    }
    return new ApiOK()
  }
  async checkRoomHost(userId: number, roomId: number) {
    const roomInfo = await this.getRoomInfo(roomId, userId)
    // if (!roomInfo) throw new ApiError('ROOM_NOT_FOUND', 'MSG_21')
    const cacheUser = await this.userService.getUserInfoRedis(userId)
    if (roomInfo.hostId === cacheUser.id) return true
    return false
  }

  async favouriteHost(userId: number, roomId: number) {

  }

  async getListHost(userId: number, data: GetHostListDto) {
    const offset = data.offset ? data.offset : 0
    const limit = data.limit ? data.limit : 5
    const activeQuery = this.roomRepository.createQueryBuilder('room')
      .innerJoin('room.host', 'host')
      .leftJoin('friends', 'friend', 'friend.userId = :userId and room.hostId = friend.friendId and friend.isDeleted = :status', { userId: userId, status: false })
      .select('room.hostId', 'id')
      .distinct(true)
      .addSelect('host.avatar', 'avatar')
      .addSelect('host.name', 'name')
      .addSelect('count(room.hostId)', 'total')
      .addSelect('friend.isFollowed', 'isFollowed')
      .addSelect('friend.status', 'status')
      .groupBy('room.hostId')

    if (data.type && data.type === HostListType.ACTIVE) {
      if (data.keyword) activeQuery.andWhere(`lower(host.name) like :name`, { name: `%${data.keyword}%` })
      const active = await activeQuery.offset(offset).limit(limit).orderBy('total', 'DESC').getRawMany()
      return active
    }

    if (!data.type && data.keyword && data.keyword.trim() !== '') {
      if (data.keyword) activeQuery.andWhere(`lower(host.name) like :name`, { name: `%${data.keyword}%` })
      const active = await activeQuery.offset(offset).limit(limit).orderBy('total', 'DESC').getRawMany()
      return active
    }
  }

  //done
  async suggestSong(userId: number, roomId: number, data: SuggestSongInRoomDto) {
  }

  async voteSong(userId: number, roomId: number, data: VoteSongDto) {
  }

  async calculateVoted(roomId: number, playlistId: number, data: VoteSongFromSocketDto[]) {
  }

  async updateVotesFromSocket(roomId: number, playlistId: number, data: VoteSongFromSocketDto[]) {

  }

  // rewriting...
  async changeInvitationStatus(userId: number, invitationId: number, type: InvitationStatus) {
    const user = await this.userService.getUserInfoRedis(userId)

    let invitation = await this.invitationRepository.findOne({
      id: invitationId,
      status: InvitationStatus.PENDING,
      userId: user.id
    })

    if (!invitation) {
      throw new ApiError('INVITATION_NOT_FOUND', 'Invitation not found')
    }

    invitation.status = type
    if (type === InvitationStatus.ACCEPTED) {
      const room = await this.getRoomInfo(invitation.roomId, userId)
      if (!room) throw new ApiError('ROOM_NOT_FOUND', 'MSG_21')
      if (room.number <= room.totalMember) throw new ApiError('ROOM_LIMITED', 'MSG_10')
      const check = await this.roomMemberRepository.findOne({
        roomId: invitation.roomId,
        userId: userId
      })
      if (!check) {
        const newMember = await this.roomMemberRepository.create({
          roomId: invitation.roomId,
          userId: userId
        })
        await this.roomMemberRepository.save(newMember)
      }
      if (check && check.isLeave === false) {
        await this.roomMemberRepository.update({
          roomId: invitation.roomId,
          userId: userId
        }, { isLeave: false })
      }
    }
    await this.invitationRepository.save(invitation)
    this.notificationRepository.update({ refId: invitation.id, userId: userId, type: NotificationType.INVITED }, { metadata: JSON.stringify({ invitationId: invitation.id, type: invitation.status }), isRead: true, isDeleted: true })
    return new ApiOK()
  }

  getRandomString(length: number) {
    // Declare all characters
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    // Pick characers randomly
    let str = '';
    for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
  }

  async getMembersOfRooms(roomIds: number[]) {
    const members = await this.roomRepository.createQueryBuilder('room')
      .innerJoinAndSelect('room.members', 'members')
      .innerJoinAndSelect('members.user', 'user')
      .where(`room.id in (:...roomIds)`, { roomIds: roomIds })
      .andWhere(`members.isLeave = false`)
      .getMany()

    const result = _.reduce(members, (data, item) => {
      data[item.id] = item.members.map(value => {
        let tmp = {
          name: value.user.name,
          avatar: value.user.avatar,
          id: value.user.id
        }
        return tmp
      })
      return data
    }, {})

    // console.log(result)
    return result
  }

  async getUserInvitedList(userId: number, roomId: number) {
    const cacheUser = await this.userService.getUserInfoRedis(userId)
    const listFriends = await this.friendRepository.createQueryBuilder('friend')
      .innerJoin('friend.friend', 'user')
      .leftJoin('room_members', 'member', 'member.userId = friend.friendId and friend.userId = :userId and member.isLeave = false and member.roomId = :roomId', { userId: userId, roomId: roomId })
      .select('user.id', 'id')
      .distinct(true)
      .addSelect('user.name', 'name')
      .addSelect('user.avatar', 'avatar')
      .addSelect('friend.isFollowed', 'isFollowed')
      .addSelect('case when member.id is not null then true else false end', 'isMember')
      .where('friend.userId = :userId', { userId: userId })
      .andWhere('friend.isDeleted = :status', { status: false })
      .andWhere('friend.status In (:...friendStatus)', { friendStatus: [FriendStatus.FRIEND] })
      .getRawMany()

    const listFollowed = await this.friendRepository.createQueryBuilder('friend')
      .innerJoin('friend.friend', 'user')
      .leftJoin('room_members', 'member', 'member.userId = friend.friendId and friend.userId = :userId and member.isLeave = false and member.roomId = :roomId', { userId: userId, roomId: roomId })
      .select('user.id', 'id')
      .distinct(true)
      .addSelect('user.name', 'name')
      .addSelect('user.avatar', 'avatar')
      .addSelect('friend.isFollowed', 'isFollowed')
      .addSelect('case when member.id is not null then true else false end', 'isMember')
      .where('friend.userId = :userId', { userId: userId })
      .andWhere('friend.isDeleted = :status', { status: false })
      .andWhere('friend.isFollowed = :isFollowed', { isFollowed: true })
      .andWhere('friend.status In (:...friendStatus)', { friendStatus: [FriendStatus.PENDING, FriendStatus.FOLLOWED] })
      .getRawMany()

    const listFollowing = await this.friendRepository.createQueryBuilder('friend')
      .innerJoin('friend.user', 'user')
      .leftJoin('room_members', 'member', 'member.userId = friend.friendId and friend.userId = :userId and member.isLeave = false and member.roomId = :roomId', { userId: userId, roomId: roomId })
      .leftJoin('friends', 'frStatus', 'frStatus.userId = friend.friendId and  frStatus.userId = :userId and friend.userId = frStatus.friendId AND frStatus.isFollowed = true ', { userId: userId })
      .select('user.id', 'id')
      .distinct(true)
      .addSelect('user.name', 'name')
      .addSelect('user.avatar', 'avatar')
      .addSelect('case when frStatus.id is not null then true else false end', 'isFollowed')
      // .addSelect('friend.isFollowed', 'isFollowed')
      .addSelect('case when member.id is not null then true else false end', 'isMember')
      .where('friend.friendId = :userId', { userId: userId })
      .andWhere('friend.isDeleted = :status', { status: false })
      .andWhere('friend.isFollowed = :isFollowed', { isFollowed: true })
      .andWhere('friend.status In (:...friendStatus)', { friendStatus: [FriendStatus.PENDING, FriendStatus.FOLLOWED] })
      .getRawMany()

    const list = _.filter(_.uniqBy(_.concat(listFriends, listFollowed, listFollowing), 'id'), value => !value.isMember)
    return list
  }

  async changeRoomMode(roomId: number, mode: RoomMode, userId: number) {
    const result = await this.roomRepository.update({ id: roomId }, { mode: mode })

    const roomInfo = await this.getRoomInfo(roomId, userId)
    return roomInfo
  }

  async endTournamentUpdate(roomId: number, result) {
  }

  async getJoinedRoom(userId: number, data: GetJoinedRoomDto) {
    const offset = data.offset ? data.offset : 0;
    const limit = data.limit ? data.limit : 10;
    const idUser = data.userId ? data.userId : userId;

    const joinedRoomQuery = this.roomRepository
      .createQueryBuilder('room')
      .select('room.id', 'id')
      .addSelect('room.name', 'name')
      .addSelect('room.number', 'number')
      .addSelect('room.type', 'type')
      .addSelect('room.code', 'code')
      .addSelect('room.description', 'description')
      .addSelect('room.cover', 'cover')
      .addSelect('room.hostId', 'hostId')
      .addSelect('users.avatar', 'hostAvatar')
      .addSelect('users.name', 'hostName')
      .innerJoin('users', 'users', 'room.hostId = users.id')
      .innerJoin(
        'room_members',
        'room_members',
        'room.id = room_members.roomId',
      )
      .where(`room_members.userId = ${idUser}`)
      .andWhere('room.isEnd = 0')

    const rooms = await joinedRoomQuery
      .offset(offset)
      .limit(limit)
      .getRawMany();
    if (_.isEmpty(rooms)) {
      return { items: [], total: 0 };
    } else {
      const members = await this.getMembersOfRooms(rooms.map(value => parseInt(value.id)))
      const result = _.reduce(
        rooms,
        (data, item) => {
          let tmp = item;
          tmp['members'] = members[item.id] ? members[item.id] : null;
          data.push(tmp);
          return data;
        },
        [],
      );
      const total = await joinedRoomQuery.getCount();
      return { items: result, total: total };
    }
  }
}
