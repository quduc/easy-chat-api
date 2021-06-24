import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { ApiOK } from '../../common/responses/api-response';
import { FriendStatus } from '../../database/entities/mysql/friend.entity';
import { DeleteFriendDto, FollowUserStatusDto, GetFriendListDto, SendFriendRequestDto } from './dto/request.dto';
import { FriendService } from './friend.service';

@Controller('friend')
@Auth()
@ApiTags('Friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) { }

  @Get()
  @ApiOperation({ summary: 'Get user friend list' })
  async getUserFriendList(@CurrentUser() user, @Query() data: GetFriendListDto) {
    const result = await this.friendService.getListFriend(user.id, data)
    return new ApiOK({ total: result.total, items: result.items })
  }

  @Post()
  @ApiOperation({ summary: 'Send request' })
  async sendRequestAddFriend(@CurrentUser() user, @Body() data: SendFriendRequestDto) {
    return await this.friendService.sendFriendRequest(user.id, data)
  }

  @Put(':requestId/accept')
  @ApiOperation({ summary: 'Accept Request' })
  async acceptRequest(@CurrentUser() user, @Param('requestId') requestId: number) {
    return await this.friendService.changeFriendRequestStatus(user.id, requestId, FriendStatus.FRIEND)
  }

  @Put(':requestId/decline')
  @ApiOperation({ summary: 'Decline request' })
  async declineRequest(@CurrentUser() user, @Param('requestId') requestId: number) {
    return await this.friendService.changeFriendRequestStatus(user.id, requestId, FriendStatus.DECLINED)
  }

  @Post('follow')
  @ApiOperation({ summary: 'Follow/Unfollow' })
  async followUser(@CurrentUser() user, @Body() data: FollowUserStatusDto) {
    return await this.friendService.followUserStatus(user.id, data)
  }

  @Delete()
  @ApiOperation({ summary: 'Delete friend' })
  async deleteFriend(@CurrentUser() user, @Body() data: DeleteFriendDto) {
    return await this.friendService.deleteFriend(user.id, data)
  }
}
