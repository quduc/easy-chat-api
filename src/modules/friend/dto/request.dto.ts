import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { FriendStatus } from "../../../database/entities/mysql/friend.entity";

export class GetFriendListDto {
  @ApiProperty({ required: false })
  @IsOptional()
  keyword: string

  @ApiProperty({ required: false })
  @IsOptional()
  userId: number

  @ApiProperty({ required: true, type: 'enum', default: FriendStatus.PENDING, enum: ['PENDING', 'FRIEND', 'FOLLOWED', 'FOLLOWER'] })
  @IsEnum(['PENDING', 'FRIEND', 'FOLLOWED', 'FOLLOWER'])
  @IsNotEmpty({ message: 'MSG_2' })
  type: string

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  offset: number

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  limit: number
}

export class SendFriendRequestDto {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'MSG_2' })
  userId: number

  @ApiProperty({ required: true, type: 'enum', enum: ['PENDING', 'BLOCKED'] })
  @IsEnum(['PENDING', 'BLOCKED'])
  @IsNotEmpty({ message: 'MSG_2' })
  type: FriendStatus
}

export class DeleteFriendDto {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'MSG_2' })
  userId: number
}

export class FollowUserStatusDto {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'MSG_2' })
  userId: number
}