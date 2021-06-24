import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { NotificationDto } from './dto/request.dto';
import { NotificationService } from './notification.service';

@Auth()
@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Get()
  @ApiOperation({ summary: 'Get notification list' })
  async getNotifications(@CurrentUser() user) {
    return await this.notificationService.getNotifications(user.id)
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get total unread notification' })
  async getCountUnreadNotification(@CurrentUser() user) {
    return await this.notificationService.countUnreadNotification(user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification' })
  async getNotification(@CurrentUser() user, @Param('id') id: number) {
    return await this.notificationService.getNotificationDetail(user.id, id)
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Read notification' })
  async readNotification(@CurrentUser() user, @Param('id') id: number) {
    return await this.notificationService.updateNotificationStatus(user.id, id)
  }

  @Post()
  @ApiOperation({ summary: 'Send notification' })
  async sendNotification(@CurrentUser() user, @Body() data: NotificationDto) {
    return await this.notificationService.sendNotifications(user.id, [data])
  }

  @Post('test')
  @ApiOperation({ summary: 'Send notification' })
  async sendTestNotification(@CurrentUser() user, @Body() data: NotificationDto) {
    return await this.notificationService.sendTestNotification(user.id, data)
  }
}
