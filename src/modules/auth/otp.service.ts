import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { ApiError } from '../../common/responses/api-error';
import { User } from '../../database/entities/mysql/user.entity';
import { ApiOK } from '../../common/responses/api-response';
import { OTP, OtpStatus, OtpType } from '../../database/entities/mysql/otp.entity';
import { AppConfig } from '../../common/constants/app-config';
import * as _ from 'lodash'
import moment from 'moment';
import { EmailService } from '../../email/email.service';
import { SendOtpToEmailDto, VerifyOtpDto } from './dto/request.dto';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OTP)
    private readonly otpRepository: Repository<OTP>,
    private readonly emailService: EmailService
  ) { }

  async generateOtp(data: SendOtpToEmailDto) {
    const cacheUser = await this.userRepository.findOne({ email: data.email })
    if (!cacheUser) {
      throw new ApiError('USER_NOT_FOUND', 'MSG_3')
    }
    let otp
    try {
      await this.otpRepository.update({ userId: cacheUser.id, type: data.type, status: In([OtpStatus.PENDING, OtpStatus.VERIFIED]) }, { status: OtpStatus.EXPIRED })

      const otpCode = _.padStart(_.random(0, Math.pow(10, AppConfig.OTP.LENGTH) - 1).toString(), AppConfig.OTP.LENGTH, '0');
      otp = await this.otpRepository.create({
        userId: cacheUser.id,
        otp: otpCode,
        expiredAt: moment().add(AppConfig.OTP.EXPIRE_TIME, 'seconds').toDate(),
        type: data.type
      })
      await this.otpRepository.save(otp)
    } catch (e) {
      console.log(e)
      throw new ApiError('SYSTEM_ERROR', 'System error')
    }
    this.emailService.sendVerifiedOtpEmail(cacheUser, otp)
    return new ApiOK()
  }

  async verifyOtp(data: VerifyOtpDto) {
    const cacheUser = await this.userRepository.findOne({ email: data.email })
    if (!cacheUser) {
      throw new ApiError('USER_NOT_FOUND', 'MSG_3')
    }
    let otp = await this.otpRepository.findOne({
      userId: cacheUser.id,
      otp: data.otp,
      type: data.type,
      status: OtpStatus.PENDING
    })

    if (!otp) {
      throw new ApiError('OTP_NOT_FOUND', 'MSG_7')
    }

    if (moment(otp.expiredAt) < moment()) {
      throw new ApiError('OTP_EXPIRED', 'MSG_6')
    }

    otp.status = OtpStatus.VERIFIED
    otp.updatedAt = moment().toDate()
    await this.otpRepository.save(otp)
    return new ApiOK(otp)
  }
}