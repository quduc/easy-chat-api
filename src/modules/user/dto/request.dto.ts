import { ApiProperty } from '@nestjs/swagger';
import {
  Allow,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import {
  RemoveSpace,
} from '../../../common/decorators/transforms.decorator';
import { ValidateUsernameRule } from '../../../common/validations/name.validation';
import { ValidatePasswordRule } from '../../../common/validations/password.validation';
import { DeviceType } from '../../../database/entities/mysql/user-device.entity';


export enum UserListDtoType {
  POPULAR = 'POPULAR',
  WINNER_OF_WEEK = 'WINNER_OF_WEEK',
  WINNER = 'WINNER'
}

export class ProfileDto {
  @ApiProperty({ required: false })
  userId: number;
}


export class UpdateProfileDto {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'MSG_2' })
  @RemoveSpace()
  @MinLength(3, { message: 'MSG_5' })
  @MaxLength(50, { message: 'MSG_5' })
  @Validate(ValidateUsernameRule)
  name: string;

  @ApiProperty({ format: 'binary' })
  @IsOptional()
  image: string

  @ApiProperty()
  @IsOptional()
  @Allow()
  description: string;

  @ApiProperty()
  @IsOptional()
  @Allow()
  birthday: string;
}

export class UpdatePasswordUserDto {
  @ApiProperty()
  @RemoveSpace()
  @IsNotEmpty({ message: 'MSG_2' })
  @MinLength(8)
  @MaxLength(16)
  @Validate(ValidatePasswordRule)
  oldPassword: string;

  @ApiProperty()
  @RemoveSpace()
  @IsNotEmpty({ message: 'MSG_2' })
  @MinLength(8, { message: 'MSG_4' })
  @MaxLength(16, { message: 'MSG_4' })
  @Validate(ValidatePasswordRule)
  newPassword: string;
}

export class RegisterUserDeviceDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'MSG_2' })
  token: string;

  @ApiProperty({ type: 'enum', enum: DeviceType, default: DeviceType.OTHER })
  @IsNotEmpty({ message: 'MSG_2' })
  platform: DeviceType;
}

export class RemoveUserDeviceDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'MSG_2' })
  token: string;

  @ApiProperty({ type: 'enum', enum: DeviceType, default: DeviceType.OTHER })
  @IsNotEmpty({ message: 'MSG_2' })
  platform: DeviceType;
}

export class GetListUserDto {
  @ApiProperty({ required: false })
  @Allow()
  @IsOptional()
  keyword: string;

  @ApiProperty({ default: 10 })
  @Allow()
  @IsOptional()
  limit: number;

  @ApiProperty({ default: 0 })
  @Allow()
  @IsOptional()
  offset: number;
}
