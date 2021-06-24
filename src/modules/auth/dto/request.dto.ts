import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, Length, MaxLength, MinLength, validate, Validate } from "class-validator";
import { RemoveSpace, TrimStr } from "../../../common/decorators/transforms.decorator";
import { ValidateEmailRule } from "../../../common/validations/email.validation";
import { ValidateUsernameRule } from "../../../common/validations/name.validation";
import { ValidatePasswordRule } from "../../../common/validations/password.validation";
import { OtpType } from "../../../database/entities/mysql/otp.entity";

export class LoginDto {
    @ApiProperty({ required: true, nullable: false })
    @TrimStr()
    @IsNotEmpty({ message: 'MSG_2' })
    @Validate(ValidateEmailRule)
    email: string;

    @ApiProperty({ required: true, nullable: false })
    @RemoveSpace()
    @IsNotEmpty({ message: 'MSG_2' })
    @Validate(ValidatePasswordRule)
    password: string
}

export class RegisterDto {
    @ApiProperty({ required: true })
    @TrimStr()
    @IsNotEmpty({ message: 'MSG_2' })
    @Validate(ValidateEmailRule)
    email: string;

    @ApiProperty({ required: true })
    @IsNotEmpty({ message: 'MSG_2' })
    @MinLength(8, { message: 'MSG_4' })
    @MaxLength(16, { message: 'MSG_4' })
    @Validate(ValidatePasswordRule)
    password: string

    @ApiProperty({ required: true })
    @RemoveSpace()
    @IsNotEmpty({ message: 'MSG_2' })
    @Validate(ValidateUsernameRule)
    @MinLength(3, { message: 'MSG_5' })
    @MaxLength(50, { message: 'MSG_5' })
    name: string
}

export class RegisterFacebookDto {
    @ApiProperty({ required: true })
    @IsNotEmpty({ message: 'MSG_2' })
    token: string
}

export class ResetPasswordDto {
    @ApiProperty({ required: true })
    @RemoveSpace()
    @IsNotEmpty({ message: 'MSG_2' })
    @MinLength(4, { message: 'MSG_8' })
    @MaxLength(4, { message: 'MSG_8' })
    otp: string

    @ApiProperty({ required: true })
    @RemoveSpace()
    @IsNotEmpty({ message: 'MSG_2' })
    @MinLength(8, { message: 'MSG_4' })
    @MaxLength(16, { message: 'MSG_4' })
    @Validate(ValidatePasswordRule)
    password: string

    @ApiProperty({ required: true })
    @IsNotEmpty({ message: 'MSG_2' })
    email: string
}

export class SendOtpDto {
    @ApiProperty({ required: true })
    @RemoveSpace()
    @IsNotEmpty({ message: 'MSG_2' })
    @Validate(ValidateEmailRule)
    email: string

    @ApiProperty({ required: false })
    @IsOptional()
    @RemoveSpace()
    otpType: string
}

export class SendOtpToEmailDto {
    @ApiProperty({ required: true })
    @IsNotEmpty({ message: 'MSG_2' })
    @Validate(ValidateEmailRule)
    email: string

    @ApiProperty({ required: true, default: OtpType.RESET_PASSWORD, enum: OtpType, type: 'enum' })
    @IsNotEmpty({ message: 'MSG_2' })
    @IsEnum(OtpType)
    type: OtpType
}

export class VerifyOtpDto {
    @ApiProperty({ required: true })
    @RemoveSpace()
    @IsNotEmpty({ message: 'MSG_2' })
    @Validate(ValidateEmailRule)
    email: string

    @ApiProperty({ required: true, default: OtpType.RESET_PASSWORD, enum: OtpType, type: 'enum' })
    @IsNotEmpty({ message: 'MSG_2' })
    @IsEnum(OtpType)
    type: OtpType

    @ApiProperty({ required: true })
    @RemoveSpace()
    @IsNotEmpty({ message: 'MSG_2' })
    @MinLength(4, { message: 'MSG_8' })
    @MaxLength(4, { message: 'MSG_8' })
    otp: string
}

export class LoginFbDto {
    @ApiProperty({ required: true })
    @IsNotEmpty({ message: 'MSG_2' })
    token: string
}