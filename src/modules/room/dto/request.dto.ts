import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { Allow, IsArray, IsEAN, IsEnum, IsNotEmpty, IsNumber, IsOptional, Length, Max, Min } from "class-validator";
import { TrimStr } from "../../../common/decorators/transforms.decorator";
import { RoomType, SkipRuleType } from "../../../database/entities/mysql/room.entity";

export enum HostListType {
  FAVOURITED = 'FAVOURITED',
  ACTIVE = "ACTIVE"
}

export enum RoomListType {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC'
}

export class GetListRoomDto {
  @ApiProperty({ required: false })
  @TrimStr()
  @IsOptional()
  keyword: string

  // @ApiProperty({ required: false })
  // @IsOptional()
  // roomIds: string

  // @ApiProperty({ required: false })
  // @IsOptional()
  // hostIds: string

  @ApiProperty({ required: false, type: 'enum', enum: RoomListType, default: null })
  @IsOptional()
  type: RoomListType

  // @ApiProperty({ required: false })
  // @IsOptional()
  // userIds: string;

  @ApiProperty({ default: 0, required: false })
  @Allow()
  offset: number

  @ApiProperty({ default: 10, required: false })
  @Allow()
  limit: number
}

export class CreateRoomDto {
  @ApiProperty()
  @TrimStr()
  @IsNotEmpty({ message: 'MSG_2' })
  @Length(0, 60)
  name: string

  @ApiProperty({ default: 10 })
  @IsNotEmpty({ message: 'MSG_2' })
  @Transform(value => parseInt(value.value))
  @IsNumber()
  @Min(1)
  @Max(999)
  number: number

  @ApiProperty({ type: 'enum', enum: RoomType })
  @IsNotEmpty({ message: 'MSG_2' })
  type: RoomType

  @ApiProperty({ required: false })
  @IsOptional()
  @TrimStr()
  description: string

  @ApiProperty({ required: false })
  @IsOptional()
  cover: string

  @ApiProperty({ required: false })
  @IsOptional()
  userIds: number[]

  @ApiProperty({ enum: SkipRuleType, type: 'enum', required: true, default: SkipRuleType.MAJORITY })
  @IsNotEmpty({ message: 'MSG_2' })
  skipRule: SkipRuleType
}

export class UpdateRoomInfoDto {
  @ApiProperty()
  @TrimStr()
  @IsNotEmpty({ message: 'MSG_2' })
  @Length(0, 60)
  name: string

  @ApiProperty({ default: 10 })
  @IsNotEmpty({ message: 'MSG_2' })
  // @IsNumber()
  // @Min(1)
  // @Max(999)
  number: number

  @ApiProperty({ enum: RoomType, type: 'enum', default: RoomType.PUBLIC })
  @IsNotEmpty({ message: 'MSG_2' })
  type: RoomType

  @ApiProperty({ required: false })
  @IsOptional()
  cover: string

  @ApiProperty({ enum: SkipRuleType, type: 'enum', required: true, default: SkipRuleType.MAJORITY })
  @IsNotEmpty({ message: 'MSG_2' })
  skipRule: SkipRuleType
}

export class KickMemberDto {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'MSG_2' })
  userIds: number[]

  // @ApiProperty({ required: true })
  // @IsNotEmpty({ message: 'MSG_2' })
  // @IsNumber()
  // roomId: number
}


export class InviteUserDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'MSG_2' })
  roomId: number

  @ApiProperty({})
  @IsOptional()
  userIds: number[]
}

export class InviteSingleUserDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'MSG_2' })
  userId: number
}

export class SuggestSongDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'MSG_2' })
  youtubeId: string
}

export class VoteSongDto {

  @ApiProperty({ required: false })
  @IsOptional()
  playlistSongId: number
}

export class VoteSongFromSocketDto extends VoteSongDto {
  @ApiProperty({ required: false })
  @IsOptional()
  userId: number
}


export class GetHostListDto {
  @ApiProperty({ required: false })
  @IsOptional()
  keyword: string

  @ApiProperty({ required: false })
  @IsOptional()
  offset: number

  @ApiProperty({ required: false })
  @IsOptional()
  limit: number

  @ApiProperty({ required: false, type: 'enum', enum: HostListType, default: null })
  @IsOptional()
  type: HostListType
}

export class GetJoinedRoomDto {
  @ApiProperty({ default: 10, required: false })
  @IsOptional()
  limit: number;

  @ApiProperty({ default: 0, required: false })
  @IsOptional()
  offset: number;

  @ApiProperty({ required: false })
  @IsOptional()
  userId: number;
}