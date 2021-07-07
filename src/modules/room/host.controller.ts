import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ApiOK } from '../../common/responses/api-response';
import { RoomService } from './room.service';
import { Auth } from '../../common/decorators/auth.decorator';

@Auth()
@Controller('host')
@ApiTags('Host')
export class HostController {
  constructor(private readonly roomService: RoomService) { }
}
