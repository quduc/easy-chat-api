import { diskStorage } from 'multer';
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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  GetListUserDto,
  ProfileDto,
  RegisterUserDeviceDto,
  UpdatePasswordUserDto,
  UpdateProfileDto,
} from './dto/request.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { ApiOK } from '../../common/responses/api-response';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../../s3/s3.service';
import { v4 as uuidv4 } from 'uuid';

import path = require('path');

export const storage = {
  storage: diskStorage({
    destination: './uploads/user',
    filename: (req, file, cb) => {
      const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;
      cb(null, `${filename}${extension}`)
    }
  })

}

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
    const result = await this.userService.getUsersFromDatabase(user.id, data);
    return new ApiOK(result);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  async profile(@CurrentUser() user, @Query() data: ProfileDto) {
    return await this.userService.getUserProfile(user.id, data);
  }

  @Post('profile')
  @UseInterceptors(FileInterceptor('image', storage))
  @ApiOperation({ summary: 'Update user profile' })
  @ApiConsumes('multipart/form-data')
  async updateProfile(@CurrentUser() user, @Body() data: UpdateProfileDto, @UploadedFile() image) {
    let file = image?.path?.replace("uploads", "")
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
}
