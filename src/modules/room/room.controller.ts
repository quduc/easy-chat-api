import { S3Service } from './../../s3/s3.service';
import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ApiOK } from '../../common/responses/api-response';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { CreateRoomDto, GetListRoomDto, InviteSingleUserDto, InviteUserDto, KickMemberDto, SuggestSongDto, UpdateRoomInfoDto, GetJoinedRoomDto } from './dto/request.dto';
import { RoomService } from './room.service';
import { Auth } from '../../common/decorators/auth.decorator';
import { InvitationStatus } from '../../database/entities/mysql/invitation.entity';
import { ApiError } from '../../common/responses/api-error';
import { SuggestSongInRoomDto } from './dto/suggest.dto';
import { FileInterceptor } from '@nestjs/platform-express';


@Auth()
@Controller('room')
@ApiTags('Room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly fileService: S3Service,
  ) { }

  @Get('')
  @ApiOperation({ summary: 'Get list room' })
  async getListRoom(@CurrentUser() user, @Query() data: GetListRoomDto) {
    return await this.roomService.getListRoom(user.id, data)
  }

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Create chat room' })
  async createRoom(@CurrentUser() user, @Body() data: CreateRoomDto, @UploadedFile() file) {
    if (file) this.fileService.validateFile(file)
    return await this.roomService.createRoom(user.id, data, file)
  }

  @Get('joinedRoom')
  async getJoinedRoom(@CurrentUser() user, @Query() data: GetJoinedRoomDto) {
    const result = await this.roomService.getJoinedRoom(user.id, data);
    return new ApiOK(result);
  }

  @Get('/:roomId')
  @ApiOperation({ summary: 'Get room info' })
  async getRoomInfo(@Param('roomId') roomId: number, @CurrentUser() user) {
    const result = await this.roomService.getRoomInfo(roomId, user.id)
    if (!result) throw new ApiError('ROOM_NOT_FOUND', 'Room not found')
    return new ApiOK(result)
  }

  @Get('/:roomId/invite-list')
  @ApiOperation({ summary: "Get user's invitation list for room" })
  async getUserInvitedList(@CurrentUser() user, @Param('roomId') roomId: number) {
    const result = await this.roomService.getUserInvitedList(user.id, roomId)
    return new ApiOK(result)
  }

  @Put('/:roomId')
  @ApiOperation({ summary: 'Update chat room info' })
  @UseInterceptors(FileInterceptor('file'))
  async updateRoomInfo(@CurrentUser() user, @Body() data: UpdateRoomInfoDto, @Param('roomId') roomId: number, @UploadedFile() file) {
    if (file) this.fileService.validateFile(file)
    return await this.roomService.updateRoomInfo(user.id, roomId, data, file)
  }

  @Get('/:roomId/join')
  @ApiOperation({ summary: 'User join room' })
  async userJoinRoom(@CurrentUser() user, @Param('roomId') roomId: number) {
    const result = await this.roomService.userJoinRoom(user.id, roomId)
    return new ApiOK(result)
  }

  @Get('/:roomId/leave')
  @ApiOperation({ summary: 'User leave room' })
  async userLeaveRoom(@CurrentUser() user, @Param('roomId') roomId: number) {
    const result = await this.roomService.userLeaveRoom(user.id, roomId)
    return new ApiOK(result)
  }

  @Post('/:roomId/kick-members')
  @ApiOperation({ summary: 'Kick members' })
  async kickMembers(@CurrentUser() user, @Param('roomId') roomId: number, @Body() data: KickMemberDto) {
    return await this.roomService.kickMembers(user.id, roomId, data)
  }

  @Post('/:roomId/invite')
  @ApiOperation({ summary: 'Invite user to room' })
  async inviteUsers(@CurrentUser() user, @Param('roomId') roomId: number, @Body() data: InviteUserDto) {
    const result = await this.roomService.inviteMembers(user.id, roomId, data)
    return new ApiOK(result)
  }

  @Post('/:roomId/invite-single')
  @ApiOperation({ summary: 'Invite user to room' })
  async inviteUser(@CurrentUser() user, @Param('roomId') roomId: number, @Body() data: InviteSingleUserDto) {
    const result = await this.roomService.inviteMember(user.id, roomId, data)
    return result
  }
}
