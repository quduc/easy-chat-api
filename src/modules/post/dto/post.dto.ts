import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, Length } from "class-validator";
import { TrimStr } from "../../../common/decorators/transforms.decorator";

export class CreatPostDto {
  @ApiProperty()
  @TrimStr()
  @IsNotEmpty({ message: 'MSG_2' })
  @Length(0, 60)
  title: string

  @ApiProperty({ format: 'binary' })
  @IsOptional()
  image: string

  @ApiProperty()
  @IsOptional()
  description: string

  @ApiProperty()
  @IsOptional()
  category: string
}

export class GetPostDto {
  @ApiProperty({ required: false })
  @IsOptional()
  userId: number


  @ApiProperty({ required: false })
  @IsOptional()
  keyword: string

  @ApiProperty({ default: 0, required: false })
  offset: number

  @ApiProperty({ default: 10, required: false })
  limit: number
}

export class LikeDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'MSG_2' })
  postId: number

  @ApiProperty()
  @IsNotEmpty({ message: 'MSG_2' })
  userId: number
}

export class AddCommentDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'MSG_2' })
  postId: number

  @ApiProperty()
  @IsNotEmpty({ message: 'MSG_2' })
  content: string
}

export class DeleteCommentDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'MSG_2' })
  idComment: number

  @ApiProperty()
  @IsNotEmpty({ message: 'MSG_2' })
  userId: number
}

export class GetPostDetailDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'MSG_2' })
  postId: number
}
