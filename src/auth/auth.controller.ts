import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

class SendOtpDto {
  @IsNotEmpty({ message: 'Số điện thoại là bắt buộc' })
  @IsString()
  phone: string;
}

class VerifyOtpDto {
  @IsNotEmpty({ message: 'Số điện thoại là bắt buộc' })
  @IsString()
  phone: string;

  @IsNotEmpty({ message: 'Mã OTP là bắt buộc' })
  @IsString()
  code: string;
}

class ResetPasswordDto {
  @IsNotEmpty({ message: 'Số điện thoại là bắt buộc' })
  @IsString()
  phone: string;

  @IsNotEmpty({ message: 'Mật khẩu mới là bắt buộc' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  newPassword: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/forgot-password
   * Send OTP to phone for password reset
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: SendOtpDto) {
    return this.authService.sendPasswordResetOTP(dto.phone);
  }

  /**
   * POST /auth/verify-otp
   * Verify OTP code
   */
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOTP(dto.phone, dto.code);
  }

  /**
   * POST /auth/reset-password
   * Reset password after OTP verification
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.phone, dto.newPassword);
  }
}
