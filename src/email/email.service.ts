import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { OTP } from '../database/entities/mysql/otp.entity';
import { User } from '../database/entities/mysql/user.entity';
import { SendEmailDto } from './dto/request.dto';
import path from 'path'

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService
  ) { }

  async doSendMail(data: SendEmailDto) {
    // console.log(data)
    try {
      await this.mailerService.sendMail(data)
    } catch (e) {
      console.log(e)
    }
  }

  async sendVerifiedOtpEmail(user: User, otp: OTP) {
    let payload = new SendEmailDto
    payload.context = {
      email: user.email,
      otpCode: otp.otp
    }
    const from = `${this.configService.mail.fromName} <${this.configService.mail.fromEmail}>`
    payload.to = user.email
    payload.subject = 'Rockwars - Verified OTP'
    payload.template = path.join(__dirname, '..', '..', 'email-templates', 'send-otp')
    payload.from = from
    this.doSendMail(payload)
  }
}
