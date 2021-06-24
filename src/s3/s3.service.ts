import { Req, Res, Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '../config/config.service';
import { v4 as uuid } from 'uuid'
import { UploadParamDto } from './dto/request.dto';
import mime from 'mime'
import * as Path from 'path'
import * as _ from 'lodash'
import { AppConfig } from '../common/constants/app-config';
import { ApiError } from '../common/responses/api-error';

@Injectable()
export class S3Service {
  constructor(
    private readonly configService: ConfigService
  ) { }

  protected s3 = new AWS.S3({
    accessKeyId: this.configService.aws.key,
    secretAccessKey: this.configService.aws.secret,
    // signatureVersion: 'v4',
    region: this.configService.aws.region
  });

  async generate(userId: number, data: UploadParamDto) {
    const path = `${data.type}/${userId}/${uuid()}_${data.name}`
    const url = await this.getPresignUrl(path)
    return url
  }

  async getPresignUrl(key: string) {
    const type = mime.lookup(Path.extname(key))
    const name = _.reverse(key.split('/'))[0]
    const params = {
      Bucket: this.configService.aws.bucket,
      Key: key,
      Expires: 604800,
      ContentType: type,
      ACL: 'public-read',
      // ContentDisposition: `inline; filename=${name}`,
    }
    const url = this.s3.getSignedUrl('putObject', params)
    return url
  }

  getFullPath(url: string) {
    if (!url) return

    const fullPath = url.split('?')[0]
    const relativePath = url.split(this.configService.aws.url)[1]
    return fullPath
  }

  async validateFile(file: any) {
    let cut = file.originalname.split('.')
    let fileExt = cut[cut.length - 1]
    if (AppConfig.EXT_IMG.indexOf(fileExt.toLocaleUpperCase()) === -1) {
      throw new ApiError('Invalid file ext.', 'E0', { field: 'file' })
    }

    if (file.size > AppConfig.MAX_FILE_UPLOAD) {
      throw new ApiError('Invalid file size.', 'E18', { field: 'file' })
    }
  }
}