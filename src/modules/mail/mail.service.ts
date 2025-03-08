import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    // Cấu hình nodemailer
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: this.configService.get('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const appUrl = this.configService.get('APP_URL');
    const verificationUrl = `${appUrl}/auth/verify/${token}`;

    await this.transporter.sendMail({
      from: `"${this.configService.get('MAIL_FROM_NAME')}" <${this.configService.get('MAIL_FROM_ADDRESS')}>`,
      to,
      subject: 'Xác thực tài khoản của bạn',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Xác thực tài khoản</h2>
          <p>Cảm ơn bạn đã đăng ký. Vui lòng click vào liên kết dưới đây để xác thực tài khoản của bạn:</p>
          <p>
            <a 
              href="${verificationUrl}" 
              style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;"
            >
              Xác thực tài khoản
            </a>
          </p>
          <p>Hoặc bạn có thể copy và paste liên kết này vào trình duyệt:</p>
          <p>${verificationUrl}</p>
          <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
        </div>
      `,
    });
  }
}
