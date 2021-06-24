import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as Joi from 'joi';

export interface DBConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  name: string;
  log: boolean;
  sync: boolean;
  migrate: boolean;
}

export interface S3Config {
  bucket: string;
  url: string;
  key: string;
  secret: string;
  region: string;
}

export interface SMTPConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  ttl: number;
  max: number
}

export interface JWTConfig {
  secret: string;
  expiresIn: string;
}


export class ConfigService {
  private readonly envConfig: dotenv.DotenvParseOutput;

  private readonly validationScheme = {
    APP_PORT: Joi.number().default(3000),
    APP_URL: Joi.string().default('/'),

    LOG_LEVEL: Joi.string().default('debug'),

    // DB_MONGO_HOST: Joi.string().required(),
    // DB_MONGO_PORT: Joi.number().required(),
    // DB_MONGO_USER: Joi.optional(),
    // DB_MONGO_PASSWORD: Joi.optional(),
    // DB_MONGO_NAME: Joi.string().required(),
    // DB_MONGO_LOG: Joi.boolean().default(false),
    // DB_MONGO_SYNC: Joi.boolean().default(true),
    // DB_MONGO_MIGRATE: Joi.boolean().default(true),

    DB_MYSQL_HOST: Joi.string().required(),
    DB_MYSQL_PORT: Joi.number().required(),
    DB_MYSQL_USER: Joi.optional(),
    DB_MYSQL_PASSWORD: Joi.optional(),
    DB_MYSQL_NAME: Joi.string().required(),
    DB_MYSQL_LOG: Joi.boolean().default(false),
    DB_MYSQL_SYNC: Joi.boolean().default(true),
    DB_MYSQL_MIGRATE: Joi.boolean().default(true),

    REDIS_HOST: Joi.string().empty(''),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_TTL: Joi.number().default(100),
    REDIS_MAX: Joi.number().default(1000),

    SOCKET_URL: Joi.string().empty(''),

    FB_APP_ID: Joi.string().empty(''),
    GOOGLE_API_KEY: Joi.string().required(),

    AWS_BUCKET: Joi.string().empty(''),
    AWS_S3URL: Joi.string().empty(''),
    AWS_KEY: Joi.string().empty(''),
    AWS_SECRET: Joi.string().empty(''),
    AWS_REGION: Joi.string().empty(''),

    JWT_SECRET: Joi.string().default('secret'),
    JWT_EXPIRATION_TIME: Joi.string().default('1d'),

    MAIL_HOST: Joi.string().empty(''),
    MAIL_PORT: Joi.number().default(22),
    MAIL_USER: Joi.string().empty(''),
    MAIL_PASS: Joi.string().empty(''),
    MAIL_FROM_NAME: Joi.string().empty(''),
    MAIL_FROM_EMAIL: Joi.string().empty(''),
  };

  constructor() {
    const configs: dotenv.DotenvParseOutput[] = [];

    const defaultEnvConfigPath = '.env';
    const defaultEnvConfig = dotenv.config({ path: defaultEnvConfigPath });

    if (defaultEnvConfig.error) {
      // tslint:disable-next-line: no-console
      console.log(`No config file at path: ${defaultEnvConfigPath}`);
    } else {
      configs.push(defaultEnvConfig.parsed);
      // tslint:disable-next-line: no-console
      console.log(`Loaded config file at path: ${defaultEnvConfigPath}`);
    }
    this.envConfig = this.validateInput(...configs);

  }

  get appUrl(): string {
    return this.envConfig.APP_URL
  }

  get dbConfigMongo(): DBConfig {
    return {
      host: String(this.envConfig.DB_MONGO_HOST),
      port: Number(this.envConfig.DB_MONGO_PORT),
      user: String(this.envConfig.DB_MONGO_USER),
      pass: String(this.envConfig.DB_MONGO_PASSWORD),
      name: String(this.envConfig.DB_MONGO_NAME),
      log: Boolean(this.envConfig.DB_MONGO_LOG),
      sync: Boolean(this.envConfig.DB_MONGO_SYNC),
      migrate: Boolean(this.envConfig.DB_MONGO_MIGRATE)
    };
  }

  get dbConfigMySQL(): DBConfig {
    return {
      host: String(this.envConfig.DB_MYSQL_HOST),
      port: Number(this.envConfig.DB_MYSQL_PORT),
      user: String(this.envConfig.DB_MYSQL_USER),
      pass: String(this.envConfig.DB_MYSQL_PASSWORD),
      name: String(this.envConfig.DB_MYSQL_NAME),
      log: Boolean(this.envConfig.DB_MYSQL_LOG),
      sync: Boolean(this.envConfig.DB_MYSQL_SYNC),
      migrate: Boolean(this.envConfig.DB_MYSQL_MIGRATE)
    };
  }

  get redisConfig(): RedisConfig {
    return {
      host: String(this.envConfig.REDIS_HOST),
      port: Number(this.envConfig.REDIS_PORT),
      ttl: Number(this.envConfig.REDIS_TTL),
      max: Number(this.envConfig.REDIS_MAX),
    };
  }

  get socketUrl(): string {
    return this.envConfig.SOCKET_URL;
  }

  get aws(): S3Config {
    return {
      bucket: String(this.envConfig.AWS_BUCKET),
      url: String(this.envConfig.AWS_S3URL),
      key: String(this.envConfig.AWS_KEY),
      secret: String(this.envConfig.AWS_SECRET),
      region: String(this.envConfig.AWS_REGION),
    };
  }

  get jwtConfig(): JWTConfig {
    return {
      secret: String(this.envConfig.JWT_SECRET),
      expiresIn: String(this.envConfig.JWT_EXPIRATION_TIME),
    }
  }

  get fbAppId(): string { return String(this.envConfig.FB_APP_ID); }

  get googleApiKey(): string { return String(this.envConfig.GOOGLE_API_KEY); }

  get port(): number {
    return Number(this.envConfig.APP_PORT);
  }
  get basePath(): string {
    return this.envConfig.APP_URL;
  }

  get mail(): SMTPConfig {
    return {
      host: String(this.envConfig.MAIL_HOST),
      port: Number(this.envConfig.MAIL_PORT),
      user: String(this.envConfig.MAIL_USER),
      pass: String(this.envConfig.MAIL_PASS),
      fromName: String(this.envConfig.MAIL_FROM_NAME),
      fromEmail: String(this.envConfig.MAIL_FROM_EMAIL),
    };
  }

  public get(key: string): string {
    return process.env[key];
  }

  public getNumber(key: string): number {
    return Number(this.get(key));
  }

  private validateInput(
    ...envConfig: dotenv.DotenvParseOutput[]
  ): dotenv.DotenvParseOutput {

    const mergedConfig: dotenv.DotenvParseOutput = {};

    envConfig.forEach(config => Object.assign(mergedConfig, config));

    const envVarsSchema: Joi.ObjectSchema = Joi.object(this.validationScheme);

    const result = envVarsSchema.validate(mergedConfig);
    if (result.error) {
      throw new Error(`Config validation error: ${result.error.message}`);
    }
    return result.value;
  }
}
