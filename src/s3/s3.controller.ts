import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '../common/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { ApiOK } from '../common/responses/api-response';
import { UploadParamDto } from './dto/request.dto';
import { S3Service } from './s3.service';

@Auth()
@ApiTags('Fileupload')
@Controller('file')
export class S3Controller {
  constructor(
    private readonly s3Service: S3Service
  ) { }

  @Post('presign-url')
  @ApiOperation({ summary: 'cover upload' })
  async uploadcover(@CurrentUser() user, @Body() data: UploadParamDto) {
    const result = await this.s3Service.generate(user.id, data)
    return new ApiOK({ url: result })
  }

}
