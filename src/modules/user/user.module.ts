import { Global, HttpModule, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/mysql/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UserDevice } from '../../database/entities/mysql/user-device.entity';
import { S3Module } from '../../s3/s3.module';
import { Friend } from '../../database/entities/mysql/friend.entity';

@Global()
@Module({
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
  imports: [
    TypeOrmModule.forFeature([User, UserDevice, Friend]),
    AuthModule,
    HttpModule,
    S3Module
  ],
})
export class UserModule { }
