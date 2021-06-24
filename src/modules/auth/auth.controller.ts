import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LoginFbDto, RegisterDto, RegisterFacebookDto, ResetPasswordDto, SendOtpToEmailDto, VerifyOtpDto } from './dto/request.dto';
import { OtpService } from './otp.service';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService
  ) { }

  @Post('login')
  @ApiOperation({ summary: 'Login to system' })
  async login(@Body() data: LoginDto) {
    return await this.authService.login(data);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register user' })
  async register(@Body() data: RegisterDto) {
    return await this.authService.register(data);
  }

  // @Post('facebook/register')
  // @ApiOperation({ summary: 'Register by facebook' })
  // async facebookRegister(@Body() data: RegisterFacebookDto) {

  // }

  @Post('facebook/login')
  @ApiOperation({ summary: 'Login by facebook' })
  async facebookLogin(@Body() data: LoginFbDto) {
    const result = await this.authService.loginFb(data)
    return result
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  async resetPassword(@Body() data: ResetPasswordDto) {
    return await this.authService.resetPassword(data)
  }

  @Post('send-otp')
  @ApiOperation({ summary: 'Send otp to email' })
  async sendOtpToEmail(@Body() data: SendOtpToEmailDto) {
    return await this.otpService.generateOtp(data)
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify otp sent to email' })
  async verifyOtp(@Body() data: VerifyOtpDto) {
    return await this.otpService.verifyOtp(data)
  }
}
