import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  GetListUserDto,
  ProfileDto,
  RegisterUserDeviceDto,
  UpdatePasswordUserDto,
  UpdateProfileDto,
  UpdateUserNotificationSettingDto,
} from './dto/request.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { ApiOK } from '../../common/responses/api-response';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../../s3/s3.service';

@Auth()
@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly fileService: S3Service,
  ) { }

  @Get('')
  @ApiOperation({ summary: 'Get user list' })
  async getListUser(@CurrentUser() user, @Query() data: GetListUserDto) {
    const result = await this.userService.getUserList(user.id, data);
    return new ApiOK(result);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  async profile(@CurrentUser() user, @Query() data: ProfileDto) {
    return await this.userService.getUserProfile(user.id, data);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @UseInterceptors(FileInterceptor('file'))

  async updateProfile(@CurrentUser() user, @Body() data: UpdateProfileDto, @UploadedFile() file) {
    file && this.fileService.validateFile(file)
    return await this.userService.updateUserProfile(user.id, data, file);
  }

  @Put('password')
  @ApiOperation({ summary: 'Update user password' })
  async updateUserPassword(
    @CurrentUser() user,
    @Body() data: UpdatePasswordUserDto,
  ) {
    return await this.userService.updatePasswordUser(user.id, data);
  }

  @Post('device')
  @ApiOperation({ summary: 'Register user device for notification' })
  async userDevices(@CurrentUser() user, @Body() data: RegisterUserDeviceDto) {
    return await this.userService.registerUserDevice(user.id, data);
  }

  @Delete('device')
  @ApiOperation({ summary: 'Remove user device for notification' })
  async removeUserDevices(
    @CurrentUser() user
  ) {
    return await this.userService.removeUserDevice(user.id);
  }

  @Get('notification-setting')
  @ApiOperation({ summary: 'Get user profile' })
  async getUserNotificationSetting(@CurrentUser() user) {
    const result = await this.userService.getUserNotificationSetting(user.id);
    return new ApiOK(result)
  }

  @Put('notification-setting')
  @ApiOperation({ summary: 'Get user profile' })
  async updateUserNotificationSetting(@CurrentUser() user, @Body() data: UpdateUserNotificationSettingDto) {
    const result = await this.userService.updateUserNotificationSetting(user.id, data);
    return new ApiOK(result)
  }
}
