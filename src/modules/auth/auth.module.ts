import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/mysql/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '../../config/config.service';
import { ConfigModule } from '../../config/config.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { OTP } from '../../database/entities/mysql/otp.entity';
import { EmailModule } from '../../email/email.module';
import { OtpService } from './otp.service';
import { FacebookAuthProvider } from './providers/facebook.provider';

@Module({
  providers: [AuthService, JwtStrategy, OtpService, FacebookAuthProvider],
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([User, OTP]),
    ConfigModule,
    EmailModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.jwtConfig.secret,
        signOptions: {
          expiresIn: configService.jwtConfig.expiresIn
        },

      }),
    }),
  ],
  exports: [AuthService]
})
export class AuthModule { }
