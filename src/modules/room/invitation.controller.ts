import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ApiOK } from '../../common/responses/api-response';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { RoomService } from './room.service';
import { Auth } from '../../common/decorators/auth.decorator';
import { InvitationStatus } from '../../database/entities/mysql/invitation.entity';

@Auth()
@Controller('invitation')
@ApiTags('Invitation')
export class InvitationController {
  constructor(private readonly roomService: RoomService) { }

  @Put(':invitationId/accept')
  @ApiOperation({ summary: 'Accept invitation' })
  async acceptInvitation(@CurrentUser() user, @Param('invitationId') invitationId: number) {
    const result = await this.roomService.changeInvitationStatus(user.id, invitationId, InvitationStatus.ACCEPTED)
    return new ApiOK(result.data)
  }

  @Put(':invitationId/decline')
  @ApiOperation({ summary: 'Decline invitation' })
  async declineInvitation(@CurrentUser() user, @Param('invitationId') invitationId: number) {
    console.log(invitationId)
    const result = await this.roomService.changeInvitationStatus(user.id, invitationId, InvitationStatus.DECLINED)
    return new ApiOK(result.data)
  }
}
