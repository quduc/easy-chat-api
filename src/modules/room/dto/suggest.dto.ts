import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class SuggestSongInRoomDto {
  // @ApiProperty()
  // @IsNotEmpty({ message: 'MSG_2' })
  // roomId: number

  @ApiProperty()
  @IsNotEmpty()
  youtubeId: string


}