import { Index } from 'typeorm';

import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import fs = require('fs');
import path = require('path');
import * as _ from 'lodash';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification, NotificationType } from '../../database/entities/mysql/notification.entity';
import { NotificationDto } from './dto/request.dto';
import { ApiError } from '../../common/responses/api-error';
import { ApiOK } from '../../common/responses/api-response';
import { UserDevice } from '../../database/entities/mysql/user-device.entity';


@Injectable()
export class NotificationService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(UserDevice)
    private readonly deviceRepository: Repository<UserDevice>,
  ) {
    this.initFirebase();
  }

  private async initFirebase() {
    const firebaseConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'firebase_config.json')).toString('utf8'));
    firebase.initializeApp({ credential: firebase.credential.cert(firebaseConfig) });
  }

  async createNotifications(userId: number, data: NotificationDto[]) {
    let newNotifications = []
    _.forEach(data, (item) => {
      let newNotification = {
        body: item.body,
        title: item.title ? item.title : null,
        senderId: userId,
        userId: item.userId,
        type: item.type ? item.type : NotificationType.SYSTEM,
        metadata: item.metadata ? item.metadata : null,
        refId: item.refId ? item.refId : null,
        isDeleted: item.isDeleted ? item.isDeleted : false
      }
      newNotifications.push(newNotification)
    })

    const notifications = await this.notificationRepository.create(newNotifications)
    await this.notificationRepository.save(notifications)

    return notifications
  }

  async sendNotifications(userId: number, data: NotificationDto[]) {
    const notifications = await this.createNotifications(userId, data)

    if (!notifications || _.isEmpty(notifications)) return false

    const tokenQuery = await this.deviceRepository.createQueryBuilder('device')
      .select('device.token', 'token').addSelect('device.userId', 'userId')
      .where('device.userId In (:...userIds)', { userIds: _.map(notifications, value => value.userId) })
      .andWhere('isDeleted = false')
      .getRawMany()

    const tokens = _.reduce(tokenQuery, (data, item) => {
      data[item.userId] = item.token
      return data
    }, {})

    _.forEach(notifications, (item) => {
      const payload = {
        data: {
          title: item.title,
          body: item.body
        }
      };
      if (tokens[item.userId])
        firebase.messaging().sendToDevice(tokens[item.userId], payload).then((response) => {
          // console.log('Successfully sent message:', response);
        }).catch((error) => {
          console.log('Error sending message:', error);
        })
    })

    return true
  }

  async sendTestNotification(userId: number, data: NotificationDto) {
    const token = await this.deviceRepository.findOne({ userId: data.userId, isDeleted: false })
    const notification = await this.notificationRepository.create({
      userId: data.userId,
      senderId: userId,
      body: data.body,
      type: NotificationType.SYSTEM,
      title: data.title
    })
    await this.notificationRepository.save(notification)
    const payload = {
      data: {
        title: notification.title,
        body: notification.body
      }
    }
    if (!token) {
      firebase.messaging().sendToDevice(token.token, payload).then((response) => {
        // console.log('success', response)
      }).catch(err => {
        console.log('error', err)
      })
    }


    return new ApiOK()

  }

  async getNotifications(userId: number) {
    const notifications = await this.notificationRepository.createQueryBuilder('notification')
      .innerJoinAndSelect('notification.sender', 'sender')
      // .addSelect('sender.avatar')
      .andWhere(`notification.isDeleted = false`)
      .andWhere(`notification.userId = :userId `, { userId: userId })
      .orderBy('notification.id', 'DESC')
      .getMany()
    const total = await this.notificationRepository.createQueryBuilder('notification')
      .innerJoin('notification.sender', 'sender')
      .where(`notification.userId = :userId `, { userId: userId })
      .andWhere(`notification.isDeleted = false`)
      .getCount()

    const items = _.reduce(notifications, (data, item) => {
      let tmp = item
      delete (tmp.sender.id)
      delete (tmp.sender.email)
      delete (tmp.sender.password)
      delete (tmp.sender.updatedAt)
      delete (tmp.sender.notificationEnable)
      delete (tmp.sender.createdAt)
      data.push(tmp)
      return data
    }, [])
    return { total: total, items: items }
  }

  async countUnreadNotification(userId: number) {
    const total = await this.notificationRepository.count({ userId: userId, isRead: false })
    return { total: total }
  }

  async getNotificationDetail(userId: number, notificationId: number) {
    const notification = await this.notificationRepository.findOne({
      id: notificationId,
      userId: userId
    })

    if (!notification) {
      throw new ApiError('NOTIFICATION_NOT_FOUND', 'Notification not found!')
    }
    return { item: notification }
  }

  async updateNotificationStatus(userId: number, notificationId: number) {
    let notification = await this.notificationRepository.findOne({
      id: notificationId,
      userId: userId,
      // isRead: false
    })

    if (!notification) {
      throw new ApiError('NOTIFICATION_NOT_FOUND', 'Notification not found!')
    }

    notification.isRead = true
    await this.notificationRepository.save(notification)
    return { items: notification }
  }
}
