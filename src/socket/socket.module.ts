import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { ChatModule } from '../modules/chat/chat.module';
import { UserModule } from '../modules/user/user.module';
import { SocketGateway } from './socket.gateway';

@Module({
  providers: [SocketGateway],
  imports: [
    ChatModule,
    UserModule,
    ConfigModule,
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
  exports: [SocketGateway]
})
export class SocketModule { }
