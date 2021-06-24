import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsJSON, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class MessageDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'MSG_2' })
  roomId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'MSG_2' })
  content: string

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsJSON()
  metadata: any

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  receiverId: number
}

export class GetMessageHistoryDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'MSG_2' })
  roomId: number;

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