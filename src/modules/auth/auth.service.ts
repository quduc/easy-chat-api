import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiError } from '../../common/responses/api-error';
import { User } from '../../database/entities/mysql/user.entity';
import { LoginDto, LoginFbDto, RegisterDto, ResetPasswordDto } from './dto/request.dto';
import * as bcrypt from 'bcrypt'
import { ApiOK } from '../../common/responses/api-response';
import { RedisService } from '../../redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from './otp.service';
import { OTP, OtpStatus } from '../../database/entities/mysql/otp.entity';
import { AppConfig } from '../../common/constants/app-config';
import { FacebookAuthProvider } from './providers/facebook.provider';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OTP)
    private readonly otpRepository: Repository<OTP>,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly fbProvider: FacebookAuthProvider
  ) { }

  async login(data: LoginDto) {
    const user = await this.userRepository.findOne({ email: data.email })
    if (!user) {
      throw new ApiError('USER_NOT_FOUND', 'MSG_1', {})
    }
    const isMatched = await bcrypt.compare(data.password, user.password)
    if (!isMatched) {
      throw new ApiError('PASSWORD_NOT_MATCHED', 'MSG_1', {})
    }

    try {
      // await this.setUserInfoRedis(user);

      delete (user.password)
      const payload = { username: user.name, id: user.id };
      const accessToken = this.jwtService.sign(payload)

      return new ApiOK({ token: accessToken });
    } catch (e) {
      console.log(e)
      throw new ApiError('SYSTEM_ERROR', 'System error', e)
    }
  }

  async register(data: RegisterDto) {
    const user = await this.userRepository.findOne({ email: data.email })
    if (user) {
      throw new ApiError('USER_EXISTED', 'MSG_34', { field: "email" })
    }
    const username = await this.userRepository.findOne({ name: data.name })
    if (username) {
      throw new ApiError('DUPLICATED_USERNAME', 'MSG_23', { field: "name" })
    }
    try {
      const newUser = await this.userRepository.create({
        name: data.name,
        email: data.email,
        password: data.password
      })
      await this.userRepository.save(newUser);
      delete (newUser.password)
      return new ApiOK()
    } catch (e) {
      console.log(e)
      throw new ApiError('SYSTEM_ERROR', 'System error', e)
    }
  }

  async loginFb(data: LoginFbDto) {
    const result = await this.fbProvider.verify(data.token)
    let user = await this.userRepository.findOne({ email: result.email })
    if (!user) {
      let newUser = await this.userRepository.create({
        email: result.email,
        name: result.name,
        avatar: result.avatar,
        isFbConnect: true,
      })
      await this.userRepository.save(newUser)
      user = newUser
    }
    if (!user.isFbConnect) {
      await this.userRepository.update({ id: user.id }, { isFbConnect: true })
    }

    try {
      await this.setUserInfoRedis(user);

      delete (user.password)
      const payload = { username: user.name, id: user.id };
      const accessToken = this.jwtService.sign(payload)

      return new ApiOK({ token: accessToken });
    } catch (e) {
      console.log(e)
      throw new ApiError('SYSTEM_ERROR', 'System error', e)
    }
  }

  async resetPassword(data: ResetPasswordDto) {
    let user = await this.userRepository.findOne({ email: data.email })
    if (!user) {
      throw new ApiError('USER_NOT_FOUND', 'MSG_1')
    }
    let otp = await this.otpRepository.findOne({
      otp: data.otp,
      status: OtpStatus.VERIFIED,
      userId: user.id
    })

    if (!otp) {
      throw new ApiError('OTP_INVALID', 'MSG_7')
    }

    const hashPassword = await bcrypt.hash(data.password, AppConfig.SALT_ROUND)
    await this.userRepository.update({ id: user.id }, { password: hashPassword });

    otp.status = OtpStatus.DONE
    await this.otpRepository.save(otp)
    return new ApiOK()
  }

  async setUserInfoRedis(user: User) {
    await this.redisService.set(`user-${user.id}`, user);
  }
}
