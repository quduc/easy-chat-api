import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional } from "class-validator"

export enum UploadType {
    COVER = 'COVER',
    AVATAR = 'AVATAR'
}

export class UploadParamDto {
    @ApiProperty({ required: false, type: 'enum', enum: UploadType, default: UploadType.AVATAR })
    @IsNotEmpty()
    type: UploadType

    @ApiProperty()
    @IsNotEmpty({ message: "MSG_2" })
    name: string
}