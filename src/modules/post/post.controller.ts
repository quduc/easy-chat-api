import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ApiOK } from '../../common/responses/api-response';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { Auth } from '../../common/decorators/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { AddCommentDto, CreatPostDto, GetPostDto } from './dto/post.dto';
import { S3Service } from '../../s3/s3.service';
import { PostService } from './post.service';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

import path = require('path');

export const storage = {
  storage: diskStorage({
    destination: './uploads/profileimages',
    filename: (req, file, cb) => {
      const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;

      cb(null, `${filename}${extension}`)
    }
  })

}

@Auth()
@Controller('post')
@ApiTags('Post')
export class PostController {
  constructor(
    private readonly fileService: S3Service,
    private readonly postService: PostService,
  ) { }

  @Post('')
  @UseInterceptors(FileInterceptor('image', storage))
  @ApiOperation({ summary: 'Create post' })
  @ApiConsumes('multipart/form-data')
  async createRoom(@CurrentUser() user, @Body() data: CreatPostDto, @UploadedFile() image) {
    console.log({ image })
    let file = image?.path?.replace("uploads", "http://localhost:3000")
    return await this.postService.createPost(user.id, data, file)
  }

  @Get('')
  @ApiOperation({ summary: 'Get list room' })
  async getListRoom(@CurrentUser() user, @Query() data: GetPostDto) {
    return await this.postService.getPost(user.id, data)
  }

  @Put(':postId/like')
  @ApiOperation({ summary: 'like/Unlike post' })
  async useLike(@CurrentUser() user, @Param('postId') postId: number) {
    const data = {
      userId: user.id,
      postId: postId
    }
    const result = await this.postService.useLike(data);
    return new ApiOK(result);
  }


  @Post(':postId/comment')
  @ApiOperation({ summary: 'like/Unlike post' })
  async addComment(@CurrentUser() user, @Query() data: AddCommentDto) {
    const result = await this.postService.addComment(user.id, data);
    return new ApiOK(result);
  }

  @Delete(':postId/comment')
  @ApiOperation({ summary: 'like/Unlike post' })
  async deleteComment(@CurrentUser() user, @Param('postId') idComment: number) {
    const data = {
      userId: user.id,
      idComment
    }
    const result = await this.postService.deleteComment(data);
    return new ApiOK(result);
  }
}
