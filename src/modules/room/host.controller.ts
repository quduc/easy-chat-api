import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ApiOK } from '../../common/responses/api-response';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { RoomService } from './room.service';
import { Auth } from '../../common/decorators/auth.decorator';
import { GetHostListDto } from './dto/request.dto';

@Auth()
@Controller('host')
@ApiTags('Host')
export class HostController {
  constructor(private readonly roomService: RoomService) { }

  @Get('list')
  @ApiOperation({ summary: 'Get list host' })
  async getListHost(@CurrentUser() user, @Query() data: GetHostListDto) {
    const result = await this.roomService.getListHost(user.id, data)
    return new ApiOK(result)
  }

  @Put(':roomId/favourite')
  @ApiOperation({ summary: 'Favourite/Unfavourite host' })
  async favouriteHost(@CurrentUser() user, @Param('roomId') roomId: number) {
    const result = await this.roomService.favouriteHost(user.id, roomId)
    return new ApiOK(result)
  }
}
