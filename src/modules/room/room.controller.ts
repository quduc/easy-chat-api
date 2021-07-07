import { S3Service } from './../../s3/s3.service';
import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { RoomService } from './room.service';
import { Auth } from '../../common/decorators/auth.decorator';


@Auth()
@Controller('room')
@ApiTags('Room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly fileService: S3Service,
  ) { }

}
