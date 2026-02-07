import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  
  // In-memory store for OTP codes (in production, use Redis)
  private otpStore = new Map<string, { code: string; expiresAt: Date }>();

  // 🎭 Test phone numbers - FAKE OTP miễn phí (không tốn tiền SMS)
  private readonly TEST_PHONES: Record<string, string> = {
    '0999999999': '123456',  // Admin test
    '0888888888': '111111',  // Test user 1
    '0777777777': '222222',  // Test user 2
    '0339001600': '999999',  // Your number
    // Thêm số test của bạn vào đây để test miễn phí
  };

  /**
   * Generate a 6-digit OTP code
   */
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP via ESMS.VN
   * 
   * Setup:
   * 1. Đăng ký: https://esms.vn/register
   * 2. Lấy API Key từ dashboard
   * 3. Thêm vào .env:
   *    ESMS_API_KEY=your_api_key
   *    ESMS_SECRET_KEY=your_secret_key
   *    ESMS_BRANDNAME=BAOTRI
   */
  async sendOTP(phone: string): Promise<string> {
    let otp: string;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // 🎭 FAKE OTP cho test numbers - MIỄN PHÍ (không tốn tiền SMS)
    if (phone in this.TEST_PHONES) {
      otp = this.TEST_PHONES[phone];
      this.otpStore.set(phone, { code: otp, expiresAt });
      
      this.logger.log(`🎭 [FAKE OTP] Test ${phone}: ${otp}`);
      this.logger.log(`✅ FREE - Không tốn phí SMS!`);
      return otp;
    }

    // Generate OTP cho số thật
    otp = this.generateOTP();
    this.otpStore.set(phone, { code: otp, expiresAt });

    // Gửi SMS qua ESMS.VN
    try {
      const apiKey = process.env.ESMS_API_KEY;
      const secretKey = process.env.ESMS_SECRET_KEY;
      const brandname = process.env.ESMS_BRANDNAME || 'BAOTRI';

      if (!apiKey || !secretKey) {
        this.logger.warn('⚠️ ESMS_API_KEY/SECRET_KEY chưa setup - Chế độ dev');
        this.logger.log(`📱 [DEV] OTP cho ${phone}: ${otp}`);
        return otp;
      }

      const response = await axios.get(
        'http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_get',
        {
          params: {
            ApiKey: apiKey,
            SecretKey: secretKey,
            Phone: phone,
            Content: `Ma OTP cua ban la: ${otp}. Co hieu luc trong 5 phut. Khong chia se voi bat ky ai.`,
            Brandname: brandname,
            SmsType: 2, // 2 = OTP/Advertising
          },
        }
      );

      if (response.data.CodeResult === '100') {
        this.logger.log(`✅ SMS sent via ESMS.VN to ${phone}`);
        this.logger.log(`💰 Chi phí: ~700đ`);
      } else {
        this.logger.error(`❌ ESMS failed: ${response.data.ErrorMessage}`);
        throw new Error(`ESMS error: ${response.data.ErrorMessage}`);
      }
    } catch (error) {
      this.logger.error(`❌ ESMS error: ${error.message}`);
      
      // Fallback: Dev mode log OTP
      if (process.env.NODE_ENV === 'development') {
        this.logger.log(`📱 [DEV FALLBACK] OTP for ${phone}: ${otp}`);
      } else {
        throw error;
      }
    }

    return otp;
  }

  /**
   * Verify OTP code
   */
  verifyOTP(phone: string, code: string): boolean {
    const stored = this.otpStore.get(phone);

    if (!stored) {
      this.logger.warn(`❌ No OTP found for phone: ${phone}`);
      return false;
    }

    if (new Date() > stored.expiresAt) {
      this.otpStore.delete(phone);
      this.logger.warn(`⏰ OTP expired for phone: ${phone}`);
      return false;
    }

    if (stored.code !== code) {
      this.logger.warn(`❌ Invalid OTP for phone: ${phone}`);
      return false;
    }

    // OTP is valid, remove it so it can't be reused
    this.otpStore.delete(phone);
    this.logger.log(`✅ OTP verified successfully for phone: ${phone}`);
    return true;
  }

  /**
   * Clean up expired OTPs (call this periodically with a cron job)
   */
  cleanupExpiredOTPs(): void {
    const now = new Date();
    let count = 0;

    for (const [phone, data] of this.otpStore.entries()) {
      if (now > data.expiresAt) {
        this.otpStore.delete(phone);
        count++;
      }
    }

    if (count > 0) {
      this.logger.log(`🧹 Cleaned up ${count} expired OTPs`);
    }
  }
}
