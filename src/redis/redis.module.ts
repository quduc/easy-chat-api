import { CacheModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { RedisService } from './redis.service';
import * as redisStore from 'cache-manager-redis-store';

@Global()
@Module({
  providers: [RedisService],
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.redisConfig.host,
        port: configService.redisConfig.port,
        ttl: configService.redisConfig.ttl,
        max: configService.redisConfig.max
      })
    })
  ],
  exports: [RedisService]
})
export class RedisModule { }
