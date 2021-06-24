import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Friend, FriendStatus } from '../../database/entities/mysql/friend.entity';
import { UserService } from '../user/user.service';
import { DeleteFriendDto, FollowUserStatusDto, GetFriendListDto, SendFriendRequestDto } from './dto/request.dto';
import * as _ from 'lodash'
import { User } from '../../database/entities/mysql/user.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationType, Notification } from '../../database/entities/mysql/notification.entity';
import { ApiError } from '../../common/responses/api-error';
import { ApiOK } from '../../common/responses/api-response';

@Injectable()
export class FriendService {

  constructor(
    private readonly userService: UserService,
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly notificationService: NotificationService
  ) { }

  async getListFriend(userId: number, data: GetFriendListDto) {
    const cacheUser = await this.userService.getUserInfoRedis(userId)
    // const statuses = [FriendStatus.FOLLOWED, FriendStatus.PENDING, FriendStatus.FRIEND]
    // if (statuses.indexOf(data.type) == -1) {
    //   throw new ApiError('INVALID_TYPE', 'Invalid type', { field: 'type', values: ['Invalid type'] })
    // }
    if (data.userId && data.type === FriendStatus.PENDING) {
      throw new ApiError('INVALID_TYPE', 'Invalid type', { field: 'type', values: ['Invalid type'] })
    }

    const currentUser = userId;
    const offset = data.offset ? data.offset : 0
    const limit = data.limit ? data.limit : 10
    const order = data.type === FriendStatus.PENDING ? 'friend.createdAt' : 'uf.name'
    const orderby = data.type === FriendStatus.PENDING ? 'DESC' : 'ASC'
    const type = data.type

    const friendQuery = this.friendRepository.createQueryBuilder('friend')
      .innerJoin('friend.friend', 'uf')
      // .leftJoin('friends', 'cStatus', `(cStatus.friendId = friend.userId and cStatus.userId = ${currentUser})`)
      .innerJoin('friend.user', 'uu')
      .addSelect('uu.id')
      .addSelect('uu.name')
      .addSelect('uu.avatar')
      .addSelect('uf.id')
      .addSelect('uf.name')
      .addSelect('uf.avatar')
    if (data.userId) {
      userId = data.userId
    }
    // PENDING, FRIEND, FOLLOWED, FOLLOWER, BLOCKED
    let status
    switch (data.type) {
      case 'PENDING':
        status = [FriendStatus.PENDING]
        friendQuery
          .leftJoin('friends', 'cStatus', `(cStatus.friendId = friend.friendId and cStatus.userId = ${currentUser} and cStatus.isDeleted = false)`)
          .andWhere(`friend.status in (:...status)`, { status: status })
        friendQuery.andWhere(`friend.friendId = :friendId`, { friendId: userId })
        break;
      case 'FRIEND':
        status = [FriendStatus.FRIEND]
        friendQuery
          .leftJoin('friends', 'cStatus', `(cStatus.friendId = friend.friendId and cStatus.userId = ${currentUser} and cStatus.isDeleted = false)`)
          .andWhere(`friend.status in (:...status)`, { status: status })
        friendQuery.andWhere(`friend.userId = :userId`, { userId: userId })
        break;
      case 'FOLLOWED':
        status = [FriendStatus.FRIEND, FriendStatus.FOLLOWED, FriendStatus.PENDING]
        friendQuery
          .leftJoin('friends', 'cStatus', `(cStatus.friendId = friend.friendId and cStatus.userId = ${currentUser} and cStatus.isDeleted = false)`)
          .andWhere(`friend.status in (:...status)`, { status: status })
        friendQuery.andWhere(`friend.userId = :userId`, { userId: userId })
        friendQuery.andWhere(`friend.isFollowed = :followed`, { followed: true })
        break;
      case 'FOLLOWER':
        status = [FriendStatus.FRIEND, FriendStatus.FOLLOWED, FriendStatus.PENDING]
        friendQuery
          .leftJoin('friends', 'cStatus', `(cStatus.friendId = friend.userId and cStatus.userId = ${currentUser} and cStatus.isDeleted = false)`)
        friendQuery.andWhere(`friend.status in (:...status)`, { status: status })
        friendQuery.andWhere(`friend.friendId = :userId`, { userId: userId })
        friendQuery.andWhere(`friend.isFollowed = :followed`, { followed: true })
        break;
    }


    if (data.keyword) {
      friendQuery
        .andWhere(`(lower(uf.name) like :name1 or lower(uu.name) like :name2)`, { name1: `%${data.keyword.toLowerCase()}%`, name2: `%${data.keyword.toLowerCase()}%` })
    }
    friendQuery
      .addSelect('cStatus.status', 'friendStatus')
      .addSelect('cStatus.isFollowed', 'isFollowed')
      .andWhere(`friend.isDeleted = :isDeleted`, { isDeleted: false })

    const total = await friendQuery.getCount()
    if (total === 0) {
      return { success: true, items: [], total: 0 }
    }

    let friends = await friendQuery.limit(limit).offset(offset).orderBy(order, orderby).getRawAndEntities()

    // console.log(friends)
    let entity = friends.entities
    let raw = friends.raw
    friends = _.reduce(entity, (data, item, index) => {
      let tmp = item
      tmp.isFollowed = raw[index].isFollowed
      tmp.friendStatus = raw[index].friendStatus
      // delete (tmp.status)
      data.push(tmp)
      return data
    }, [])

    return { success: true, total: total, items: friends }
  }

  async sendFriendRequest(userId: number, data: SendFriendRequestDto) {
    const sender = await this.userService.getUserInfoRedis(userId)
    const user = await this.userService.getUserInfoRedis(data.userId)
    if (data.userId == userId) {
      throw new ApiError('INVALID_USER', 'Send friend request to yourself?')
    }

    if ([FriendStatus.PENDING, FriendStatus.BLOCKED].indexOf(data.type) == -1) {
      throw new ApiError('INVALID_TYPE', 'Invalid type', { field: 'type', values: ['Invalid type'] })
    }

    let checkRequestSent = await this.friendRepository.findOne({ userId: sender.id, friendId: user.id })
    const checkRequestReceived = await this.friendRepository.findOne({ userId: user.id, friendId: sender.id })

    //check if blocked
    if ((checkRequestSent && checkRequestSent.status === FriendStatus.BLOCKED) || (checkRequestReceived && checkRequestReceived.status === FriendStatus.BLOCKED)) {
      if (checkRequestSent.isDeleted === true) throw new ApiError('USER_BLOCKED', 'Unblock first.')
      if (checkRequestReceived.isDeleted === true) throw new ApiError('USER_BLOCKED', 'Cannot send your request.')
    }

    //check if accepted 
    if ((checkRequestSent && checkRequestSent.status === FriendStatus.FRIEND) || (checkRequestReceived && checkRequestReceived.status === FriendStatus.FRIEND)) {
      throw new ApiError('USER_BEING_FRIEND', 'Already friend.')
    }

    //check if pending
    if ((checkRequestSent && checkRequestSent.status === FriendStatus.PENDING) || (checkRequestReceived && checkRequestReceived.status === FriendStatus.PENDING)) {
      if (checkRequestSent && checkRequestSent.status === FriendStatus.PENDING) {
        checkRequestSent.isDeleted = !checkRequestSent.isDeleted
        checkRequestSent.isFollowed = !checkRequestSent.isDeleted
        await this.friendRepository.save(checkRequestSent)
        this.notificationRepository.update({ refId: checkRequestSent.id, senderId: sender.id, type: NotificationType.FRIEND }, { metadata: JSON.stringify({ requestId: checkRequestSent.id }), isDeleted: checkRequestSent.isDeleted, isRead: false })
        return new ApiOK()
      }
      if (checkRequestReceived && checkRequestReceived.status === FriendStatus.PENDING) throw new ApiError('REQUEST_RECEIVED', 'MSG_39', { requestId: checkRequestReceived.id })
    }

    if (!checkRequestSent) {
      checkRequestSent = await this.friendRepository.create({
        userId: sender.id,
        friendId: user.id,
        status: data.type,
        isFollowed: true
      })
      await this.friendRepository.save(checkRequestSent)
      this.notificationService.sendNotifications(sender.id, [{
        body: `${sender.name}`,
        title: 'Friend request',
        type: NotificationType.FRIEND,
        userId: user.id,
        senderId: sender.id,
        metadata: JSON.stringify({ requestId: checkRequestSent.id }),
        refId: checkRequestSent.id,
        isDeleted: checkRequestSent.isDeleted
      }])
    } else {
      if (data.type === FriendStatus.PENDING && checkRequestSent.status === FriendStatus.DECLINED) {
        this.notificationService.sendNotifications(sender.id, [{
          body: `${sender.name} sent you a friend request.`,
          title: 'Friend request',
          type: NotificationType.FRIEND,
          userId: user.id,
          senderId: sender.id,
          metadata: JSON.stringify({ requestId: checkRequestSent.id }),
          refId: checkRequestSent.id,
          isDeleted: checkRequestSent.isDeleted
        }])
      }
      checkRequestSent.status = data.type
      checkRequestSent.isDeleted = false
      await this.friendRepository.save(checkRequestSent)
    }
    if (data.type === FriendStatus.PENDING) {
      await this.friendRepository.save(checkRequestSent)
    }
    if (data.type === FriendStatus.BLOCKED) {
      this.notificationRepository.update({ refId: checkRequestSent.id, senderId: sender.id, type: NotificationType.FRIEND }, { metadata: JSON.stringify({ requestId: checkRequestSent.id, type: FriendStatus.BLOCKED }), isDeleted: true, isRead: false })
    }
    return new ApiOK()
  }

  async changeFriendRequestStatus(userId: number, requestId: number, type: FriendStatus) {
    const cacheUser = await this.userService.getUserInfoRedis(userId)
    let request = await this.friendRepository.findOne(requestId)
    if (!request) {
      throw new ApiError('REQUEST_NOT_FOUND', 'Request not found!')
    }
    let check
    switch (type) {
      case FriendStatus.FRIEND:
        check = await this.friendRepository.findOne({ friendId: request.userId, userId: request.friendId })
        if (!check) {
          check = await this.friendRepository.create({ friendId: request.userId, userId: request.friendId, status: FriendStatus.FRIEND, isFollowed: true })
          await this.friendRepository.save(check)
        }
        if (check.status === FriendStatus.BLOCKED) {
          throw new ApiError('USER_BLOCKED', "Unblock this user first", { requestId: check.id })
        }
        check.isDeleted = false
        check.status = FriendStatus.FRIEND
        await this.friendRepository.save(check)
        request.isFollowed = true
        this.notificationService.sendNotifications(userId, [{
          body: `${cacheUser.name} accepted your friend request.`,
          title: 'Friend request',
          type: NotificationType.ACCEPTED_REQUEST,
          userId: request.userId,
          senderId: cacheUser.id,
          metadata: null,
          refId: null,
          isDeleted: false
        }])
        break;
      case FriendStatus.DECLINED:
        check = await this.friendRepository.findOne({ friendId: request.userId, userId: request.friendId })
        // if (check) check.isFollowed = false
        // request.isFollowed = false
        if (request.isFollowed) type = FriendStatus.FOLLOWED
        // await this.friendRepository.save(check)
        break
      case FriendStatus.BLOCKED:
        check = await this.friendRepository.findOne({ friendId: request.userId, userId: request.friendId })
        if (check) {
          check.isFollowed = false
          await this.friendRepository.save(check)
        }
        request.isFollowed = false
        break
      case FriendStatus.FOLLOWED:
        check = await this.friendRepository.findOne({ friendId: request.userId, userId: request.friendId })
        if (check) {
          check.isDeleted = true
          await this.friendRepository.save(check)
        }
        break;
    }
    request.status = type
    await this.friendRepository.save(request)
    let notification = await this.notificationRepository.findOne({ userId: userId, refId: request.id, type: NotificationType.FRIEND })
    if (notification) {
      let metadata = JSON.parse(notification.metadata)
      metadata.status = type
      notification.metadata = JSON.stringify(metadata)
      notification.isRead = true
      await this.notificationRepository.save(notification)
    }
    return new ApiOK()
  }

  async deleteFriend(userId: number, data: DeleteFriendDto) {
    const cacheUser = await this.userService.getUserInfoRedis(userId)
    const friend = await this.userService.getUserInfoRedis(data.userId)
    const friendRecords = await this.friendRepository.find({
      where: [{
        userId: cacheUser.id,
        friendId: friend.id,
        status: FriendStatus.FRIEND,
        isDeleted: false
      }, {
        userId: friend.id,
        friendId: cacheUser.id,
        status: FriendStatus.FRIEND,
        isDeleted: false
      }]
    })

    if (_.isEmpty(friendRecords) || friendRecords.length < 2) {
      throw new ApiError('NOT_FRIEND', 'You and this user isnot friend.')
    }
    await this.friendRepository.update({
      id: In(friendRecords.map(value => value.id))
    }, { isDeleted: true, status: FriendStatus.DECLINED })

    return new ApiOK()
  }

  async followUserStatus(userId: number, data: FollowUserStatusDto) {
    const cacheUser = await this.userService.getUserInfoRedis(userId)
    const friend = await this.userService.getUserInfoRedis(data.userId)

    let sentRequest = await this.friendRepository.findOne({ userId: userId, friendId: friend.id })
    if (!sentRequest) {
      sentRequest = await this.friendRepository.create({
        userId: userId,
        friendId: friend.id,
        status: FriendStatus.FOLLOWED,
        isFollowed: true
      })
      await this.friendRepository.save(sentRequest)
      return new ApiOK()
    }
    if (sentRequest && sentRequest.isDeleted) {
      sentRequest.isDeleted = false
      sentRequest.isFollowed = false
      sentRequest.status = FriendStatus.FOLLOWED
    }
    sentRequest.isFollowed = !sentRequest.isFollowed
    if (sentRequest.isFollowed) {
      this.notificationService.sendNotifications(userId, [{
        body: `${cacheUser.name} followed you.`,
        title: `${cacheUser.name} followed you.`,
        type: NotificationType.FOLLOWING_INFO,
        userId: friend.id,
        senderId: cacheUser.id,
        metadata: null,
        refId: null,
        isDeleted: false
      }])
    }
    await this.friendRepository.save(sentRequest)
    return new ApiOK()
  }



}
