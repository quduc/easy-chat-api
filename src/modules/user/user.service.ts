import { FriendStatus } from './../../database/entities/mysql/friend.entity';
import { HttpService, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ApiError } from '../../common/responses/api-error';
import { ApiOK } from '../../common/responses/api-response';
import { User } from '../../database/entities/mysql/user.entity';
import { RedisService } from '../../redis/redis.service';
import {
  GetListUserDto,
  ProfileDto,
  RegisterUserDeviceDto,
  UpdatePasswordUserDto,
  UpdateProfileDto,
} from './dto/request.dto';
import * as bcrypt from 'bcrypt';
import { AppConfig } from '../../common/constants/app-config';
import { UserDevice } from '../../database/entities/mysql/user-device.entity';
import { S3Service } from '../../s3/s3.service';
import * as _ from 'lodash';
import { UploadType } from '../../s3/dto/request.dto';
import moment from 'moment';
import { Number } from 'mongoose';
import { Friend } from '../../database/entities/mysql/friend.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserDevice)
    private readonly deviceRepository: Repository<UserDevice>,
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    private readonly redisService: RedisService,
    private readonly fileService: S3Service,
    private readonly httpService: HttpService
  ) { }

  async getUserProfile(currentId: number, data?: ProfileDto) {
    try {
      const IdUser = data && data.userId ? data.userId : currentId
      const queryFriend = await this.friendRepository.createQueryBuilder('friends')
        .select('count(friends.userId)', 'numberFriend')
        .where(`friends.userId = ${IdUser} AND friends.status = '${FriendStatus.FRIEND}'`)
        .getRawMany()
      const queryFollowers = await this.friendRepository.createQueryBuilder('friends')
        .select('count(friends.userId)', 'numberFollowers')
        .where(`friends.friendId = ${IdUser} AND friends.isFollowed = 1`)
        .getRawMany()
      const queryFollowing = await this.friendRepository.createQueryBuilder('friends')
        .select('count(friends.userId)', 'numberFollowing')
        .where(`friends.userId = ${IdUser} AND friends.isFollowed = 1 and friends.isDeleted = false`)
        .getRawMany()

      const queryUser = await this.userRepository.createQueryBuilder('user')
        .where(`user.id = ${IdUser}`)
        .getOne()
      delete (queryUser.password)
      delete (queryUser.updatedAt)
      delete (queryUser.isFbConnect)

      const result = Object.assign({}, queryUser, {
        numberFriend: parseInt(queryFriend[0].numberFriend),
        queryFollowers: parseInt(queryFollowers[0].numberFollowers),
        queryFollowing: parseInt(queryFollowing[0].numberFollowing)
      })
      return new ApiOK(result);
    } catch (e) {
      console.log(e);
      throw new ApiError('SYSTEM_ERROR', 'System error', e);
    }
  }
  //writing
  async getUserList(userId: number, data: GetListUserDto) {
  }

  async getUsersFromDatabase(data: GetListUserDto, userId: number) {
    const offset = data.offset ? data.offset : 0
    const limit = data.limit ? data.limit : 10
    const usersQuery = this.userRepository.createQueryBuilder('user')
      .leftJoin('friends', 'fr', 'fr.friendId = user.id and fr.userId = :userId and fr.isDeleted = false', { userId: userId })
      .select('user.id', 'id')
      .addSelect('user.name', 'name')
      .addSelect('user.avatar', 'avatar')
      .addSelect(`fr.status`, 'friendStatus')
      .addSelect(`case when fr.isFollowed is not null and fr.isFollowed = true then true else false end`, 'isFollowed')

    if (data.keyword && !_.isEmpty(data.keyword)) {
      usersQuery.andWhere(
        `(lower(user.name) like :name)`,
        {
          name: `%${data.keyword.toLowerCase()}%`,
        },
      );
    }

    const users = await usersQuery.offset(offset)
      .limit(limit)
      .groupBy('user.id')
      .orderBy('name', 'ASC')
      .addOrderBy('name', 'ASC')
      .getRawMany();

    return users
  }

  async updateUserProfile(userId: number, data: UpdateProfileDto, file?) {
    const cacheUser = await this.getUserInfoRedis(userId);

    const username = await this.userRepository.findOne({
      name: data.name,
      id: Not(userId),
    });
    if (username)
      throw new ApiError('DUPLICATED_USERNAME', 'MSG_23', { field: 'name' });
    if (file) {
      const presignUrl = await this.fileService.generate(cacheUser.id, { name: file.originalname, type: UploadType.COVER })
      let buffer = file.buffer
      await this.httpService.put(presignUrl, buffer, {
        headers: { 'Content-Type': file.mimetype }
      }).toPromise()
      data.avatar = this.fileService.getFullPath(presignUrl)
    }
    try {
      delete cacheUser.password;
      const newInfo = Object.assign({}, cacheUser, data);
      // await this.setUserInfoRedis(newInfo);
      this.userRepository.save(newInfo);

      return new ApiOK(newInfo);
    } catch (e) {
      console.log(e);
      throw new ApiError('SYSTEM_ERROR', 'System error', e);
    }
  }

  async updatePasswordUser(userId: number, data: UpdatePasswordUserDto) {
    let cacheUser = await this.getUserInfoRedis(userId);
    const isMatched = await bcrypt.compare(
      data.oldPassword,
      cacheUser.password,
    );
    if (!isMatched) {
      throw new ApiError('PASSWORD_NOT_MATCHED', 'MSG_24', {});
    }

    const hashPassword = await bcrypt.hash(
      data.newPassword,
      AppConfig.SALT_ROUND,
    );

    await this.userRepository.update(
      { id: userId },
      { password: hashPassword },
    );
    const newInfo = await this.userRepository.findOne({ id: userId });
    // await this.setUserInfoRedis(newInfo);
    return new ApiOK(newInfo);
  }

  async registerUserDevice(userId: number, data: RegisterUserDeviceDto) {
    const cacheUser = await this.getUserInfoRedis(userId);

    let device = await this.deviceRepository.findOne({
      // token: data.token,
      userId: userId,
    });
    if (!device) {
      device = await this.deviceRepository.create({
        userId: userId,
        token: data.token,
        platform: data.platform,
      });
    } else {
      device = Object.assign({}, device, data, { isDeleted: false });
    }
    await this.deviceRepository.save(device);
    return new ApiOK(device);
  }

  async removeUserDevice(userId: number) {
    let device = await this.deviceRepository.findOne({
      userId: userId,
      isDeleted: false,
    });
    if (device) {
      device.isDeleted = true;
      await this.deviceRepository.save(device);
    }
    return new ApiOK();
  }

  async getUserInfoRedis(userId) {
    let cacheUser
    console.log('Get user from database');
    cacheUser = await this.userRepository.findOne({ id: userId });
    if (!cacheUser) {
      throw new ApiError('USER_NOT_FOUND', 'User not found!', {});
      // return { success: false, message: 'User not found!', code: 'USER_NOT_FOUND' }
    } else {
      // await this.setUserInfoRedis(cacheUser);
    }
    return cacheUser;
  }

  // async setUserInfoRedis(user: User) {
  //   await this.redisService.set(`user-${user.id}`, user);setUserInfoRedis
  // }
}
