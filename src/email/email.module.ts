import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import * as path from 'path';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { UserModule } from '../modules/user/user.module';

@Module({
  controllers: [EmailController],
  providers: [EmailService],
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.mail.host,
          port: configService.mail.port,
          ignoreTLS: true,
          secure: true,
          auth: {
            user: configService.mail.user,
            pass: configService.mail.pass,
          }
        },
        defaults: {
          from: configService.mail.fromName
        },
        template: {
          dir: path.join(__dirname, '..', '..', 'email-templates'),
          adapter: new EjsAdapter(),
          options: {
            strict: true,
          },
        }
      })
    })
  ],
  exports: [EmailService]
})
export class EmailModule { }
