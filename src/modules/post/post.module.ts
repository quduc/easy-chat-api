import { Post } from './../../database/entities/mysql/post.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Like } from './../../database/entities/mysql/like.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { S3Module } from '../../s3/s3.module';
import { Comment } from '../../database/entities/mysql/comment.entity';
import { User } from '../../database/entities/mysql/user.entity';

@Module({
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
  imports: [
    TypeOrmModule.forFeature([Post, Like, Comment, User]),
    UserModule,
    S3Module
  ]
})
export class PostModule { }
