import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from './sms.service';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
  ) {}

  // Store reset tokens in memory (in production, use Redis)
  private resetTokens = new Map<string, { email: string; expiresAt: Date }>();

  /**
   * Normalize phone number to standard format
   * - If 9 digits starting with 3-9: add 0 prefix
   * - Otherwise: keep as is
   */
  private normalizePhone(phone: string): string {
    if (!phone) {
      return phone;
    }
    
    const trimmed = phone.trim();
    
    // If phone is 9 digits starting with 3-9, add 0 prefix
    // Vietnamese mobile numbers: 03x, 05x, 07x, 08x, 09x
    if (/^[3-9][0-9]{8}$/.test(trimmed)) {
      return '0' + trimmed;
    }
    
    return trimmed;
  }

  /**
   * Send OTP to phone number for password reset
   */
  async sendPasswordResetOTP(phone: string): Promise<{ message: string; otp?: string }> {
    // Check if phone is provided
    if (!phone) {
      throw new BadRequestException('Số điện thoại là bắt buộc');
    }

    // Normalize phone number
    const normalizedPhone = this.normalizePhone(phone);
    
    // Validate phone format (Vietnamese phone numbers)
    const phoneRegex = /^(\+84|0)[0-9]{9}$/;
    if (!phoneRegex.test(normalizedPhone)) {
      throw new BadRequestException('Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)');
    }

    // Check if user exists with this phone number
    const user = await this.prisma.user.findFirst({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản với số điện thoại này');
    }

    // Send OTP
    const otp = await this.smsService.sendOTP(normalizedPhone);

    // In development, return OTP in response for testing
    if (process.env.NODE_ENV === 'development') {
      return {
        message: 'Mã OTP đã được gửi đến số điện thoại của bạn',
        otp, // Only for development/testing
      };
    }

    return {
      message: 'Mã OTP đã được gửi đến số điện thoại của bạn',
    };
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(phone: string, code: string): Promise<{ valid: boolean; message: string }> {
    if (!phone) {
      throw new BadRequestException('Số điện thoại là bắt buộc');
    }
    if (!code) {
      throw new BadRequestException('Mã OTP là bắt buộc');
    }

    const normalizedPhone = this.normalizePhone(phone);
    const isValid = this.smsService.verifyOTP(normalizedPhone, code);

    if (!isValid) {
      return {
        valid: false,
        message: 'Mã OTP không hợp lệ hoặc đã hết hạn',
      };
    }

    return {
      valid: true,
      message: 'Xác thực OTP thành công',
    };
  }

  /**
   * Reset password after OTP verification
   */
  async resetPassword(phone: string, newPassword: string): Promise<{ message: string }> {
    if (!phone) {
      throw new BadRequestException('Số điện thoại là bắt buộc');
    }
    if (!newPassword) {
      throw new BadRequestException('Mật khẩu mới là bắt buộc');
    }

    const normalizedPhone = this.normalizePhone(phone);
    
    // Find user by phone
    const user = await this.prisma.user.findFirst({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }

    // Validate password strength
    if (newPassword.length < 6) {
      throw new BadRequestException('Mật khẩu phải có ít nhất 6 ký tự');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return {
      message: 'Đổi mật khẩu thành công',
    };
  }

  /**
   * Send password reset email with token
   */
  async sendPasswordResetEmail(email: string): Promise<{ message: string }> {
    if (!email) {
      throw new BadRequestException('Email là bắt buộc');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Email không hợp lệ');
    }

    // Check if user exists
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản với email này');
    }

    // Generate reset token
    const resetToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Token expires in 15 minutes

    // Store token
    this.resetTokens.set(resetToken, { email, expiresAt });

    // Send email
    await this.emailService.sendPasswordResetEmail(email, resetToken, user.fullName);

    return {
      message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',
    };
  }

  /**
   * Verify reset token
   */
  async verifyResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
    if (!token) {
      throw new BadRequestException('Token là bắt buộc');
    }

    const stored = this.resetTokens.get(token);

    if (!stored) {
      return { valid: false };
    }

    if (new Date() > stored.expiresAt) {
      this.resetTokens.delete(token);
      return { valid: false };
    }

    return { valid: true, email: stored.email };
  }

  /**
   * Reset password with token
   */
  async resetPasswordWithToken(token: string, newPassword: string): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestException('Token là bắt buộc');
    }
    if (!newPassword) {
      throw new BadRequestException('Mật khẩu mới là bắt buộc');
    }

    // Verify token
    const tokenData = this.resetTokens.get(token);
    if (!tokenData) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }

    if (new Date() > tokenData.expiresAt) {
      this.resetTokens.delete(token);
      throw new BadRequestException('Token đã hết hạn');
    }

    // Validate password strength
    if (newPassword.length < 6) {
      throw new BadRequestException('Mật khẩu phải có ít nhất 6 ký tự');
    }

    // Find user
    const user = await this.prisma.user.findFirst({
      where: { email: tokenData.email },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete token so it can't be reused
    this.resetTokens.delete(token);

    return {
      message: 'Đổi mật khẩu thành công',
    };
  }

  /**
   * Clean up expired reset tokens (call periodically)
   */
  cleanupExpiredTokens(): void {
    const now = new Date();
    let count = 0;

    for (const [token, data] of this.resetTokens.entries()) {
      if (now > data.expiresAt) {
        this.resetTokens.delete(token);
        count++;
      }
    }

    if (count > 0) {
      console.log(`🧹 Cleaned up ${count} expired reset tokens`);
    }
  }
}
