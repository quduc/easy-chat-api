import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { S3Controller } from './s3.controller';
import { ConfigModule } from '../config/config.module';
// import { UserModule } from '../modules/user/user.module';

@Module({
  providers: [S3Service],
  controllers: [S3Controller],
  imports: [
    ConfigModule,
    // UserModule
  ],
  exports: [S3Service]
})
export class S3Module { }
