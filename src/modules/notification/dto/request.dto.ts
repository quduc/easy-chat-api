import { ApiProperty } from "@nestjs/swagger";
import { IsJSON, IsNotEmpty, IsOptional } from "class-validator";
import { NotificationType } from "../../../database/entities/mysql/notification.entity";

export class NotificationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  title: string

  @ApiProperty()
  @IsNotEmpty({ message: 'MSG_2' })
  body: string

  @ApiProperty()
  @IsNotEmpty({ message: 'MSG_2' })
  userId: number

  @ApiProperty({ required: false })
  @IsOptional()
  senderId: number

  @ApiProperty({ required: false, type: 'enum', enum: NotificationType, default: NotificationType.SYSTEM })
  @IsOptional()
  type: NotificationType

  @ApiProperty({ required: false, type: 'JSON' })
  @IsOptional()
  @IsJSON()
  metadata: string

  @ApiProperty({ required: false })
  @IsOptional()
  refId?: number

  @ApiProperty({ required: false })
  @IsOptional()
  isDeleted?: boolean
}