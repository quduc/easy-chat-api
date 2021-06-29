import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsJSON, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class MessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'MSG_2' })
  content: string

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  receiverId: number
}

export class GetMessageHistoryDto {
  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  receiverId: number

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  lastId: number

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  limit: number
}

export class GetMessageDto {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  offset: number

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  limit: number
}