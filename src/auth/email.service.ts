import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;

  constructor() {
    // Khởi tạo Resend client
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      this.logger.warn(
        '⚠️  RESEND_API_KEY chưa được cấu hình. Email sẽ không được gửi. Xem hướng dẫn tại docs/RESEND_SETUP.md'
      );
    } else {
      this.resend = new Resend(apiKey);
      this.logger.log('✅ Resend email service đã được khởi tạo');
    }
  }

  /**
   * Gửi email reset password
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName: string
  ): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
            }
            .container {
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .button {
              display: inline-block;
              padding: 14px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #777;
              font-size: 12px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🔐 Đặt lại mật khẩu</h1>
            </div>
            
            <div class="content">
              <p>Xin chào <strong>${userName}</strong>,</p>
              
              <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
              
              <p>Nhấn vào nút bên dưới để tạo mật khẩu mới:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
              </div>
              
              <p style="color: #666; font-size: 14px;">Hoặc copy link sau vào trình duyệt:</p>
              <p style="background: #f5f5f5; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 13px;">
                ${resetUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ Lưu ý:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Link này chỉ có hiệu lực trong <strong>15 phút</strong></li>
                  <li>Link chỉ sử dụng được <strong>1 lần</strong></li>
                  <li>Không chia sẻ link này với bất kỳ ai</li>
                </ul>
              </div>
              
              <p style="color: #666;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            </div>
            
            <div class="footer">
              <p>© 2026 360 CAR. All rights reserved.</p>
              <p>Email này được gửi tự động, vui lòng không reply.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    try {
      if (!this.resend) {
        // Development mode: Log email thay vì gửi thật
        this.logger.warn('⚠️ RESEND_API_KEY chưa setup - Development mode');
        this.logger.log('📧 [DEV MODE] Email would be sent to:', email);
        this.logger.log('🔗 Reset URL:', resetUrl);
        this.logger.log('⏰ Token expires in 15 minutes');
        return;
      }

      const { data, error } = await this.resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: email,
        subject: 'Đặt lại mật khẩu - 360 CAR',
        html: emailHtml,
      });

      if (error) {
        this.logger.error(`❌ Failed to send email:`, error);
        throw new Error('Không thể gửi email. Vui lòng thử lại sau.');
      }

      this.logger.log(`✅ Password reset email sent to ${email} (ID: ${data?.id})`);
    } catch (error) {
      this.logger.error(`❌ Failed to send email: ${error.message}`);
      throw new Error('Không thể gửi email. Vui lòng thử lại sau.');
    }
  }

  /**
   * Kiểm tra Resend API key
   */
  async verifyConnection(): Promise<boolean> {
    try {
      if (!this.resend) {
        this.logger.warn('⚠️ RESEND_API_KEY not configured');
        return false;
      }
      this.logger.log('✅ Email service is ready (Resend)');
      return true;
    } catch (error) {
      this.logger.error(`❌ Email service error: ${error.message}`);
      return false;
    }
  }
}