import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {
    const user = config.get<string>('MAIL_USER');
    const pass = config.get<string>('MAIL_PASS');

    if (!user || !pass) {
      throw new Error('MAIL_USER and MAIL_PASS must be defined in environment variables');
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  async sendVerificationEmail(to: string, name: string, verifyUrl: string) {
    const from = this.config.get<string>('MAIL_USER');
    const emailHTML = `
      <!doctype html>
      <html lang="vi">
      <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width">
      <title>Xác thực tài khoản đăng ký</title>
      <style>
    body { margin:0; padding:0; background-color:#f4f6f8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    .container { width:100%; max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
    .header { padding:20px; text-align:center; background:linear-gradient(90deg,#1e90ff,#3fb0ff); color:#fff; }
    .preheader { display:none !important; visibility:hidden; opacity:0; height:0; width:0; }
    .content { padding:28px; color:#333333; line-height:1.5; }
    .btn { display:inline-block; padding:12px 20px; border-radius:6px; text-decoration:none; font-weight:600; }
    .btn-primary { background:#1e90ff; color:#ffffff; }
    .note { font-size:13px; color:#666666; margin-top:18px; }
    .footer { padding:18px; font-size:13px; color:#999999; text-align:center; }
    @media (max-width:420px){ .content { padding:18px; } .header{padding:14px} }
  </style>
</head>
<body>
  <!-- Preheader (hiện tóm tắt trong inbox) -->
  <div class="preheader">Xác thực email của bạn để hoàn tất đăng ký.</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8; padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" class="container" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <h1 style="margin:0; font-size:20px;">Xác thực email</h1>
            </td>
          </tr>

          <tr>
            <td class="content">
              <p style="margin:0 0 12px 0;">Chào <strong>${name}</strong>,</p>

              <p style="margin:0 0 18px 0;">
                Cảm ơn bạn đã đăng ký tài khoản trên <strong>TechZone</strong>. Vui lòng nhấn nút bên dưới để xác thực địa chỉ email và hoàn tất quá trình đăng ký:
              </p>

              <p style="text-align:center; margin:24px 0;">
                <a href="${verifyUrl}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Xác thực email</a>
              </p>

              <p class="note">
                Lưu ý: Link này có hiệu lực trong <strong>30 phút</strong> kể từ khi gửi. Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này — không có hành động nào khác cần thiết.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 28px 28px 28px;">
              <hr style="border:none; border-top:1px solid #eef1f4; margin:0 0 16px 0;">
              <div class="footer">
                <div style="margin-bottom:6px;">© 2025 TechZone. Mọi quyền được bảo lưu.</div>
                <div>Nếu cần trợ giúp, phản hồi về <a href="mailto:laptop8386@gmail.com">laptop8386@gmail.com</a></div>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
    </html>`;

    const info = await this.transporter.sendMail({
        from,
        to,
        subject: 'Verify Your Account',
        html: emailHTML,
    });
    this.logger.log(`Sent verification email to ${to} - ${info.messageId}`);
    return info;
  }

  async sendPasswordResetEmail(to: string, name: string, codeID: string) {
    const from = this.config.get<string>('MAIL_USER');
    const emailHTML = `
    <!doctype html>
    <html lang="vi">
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>Đặt lại mật khẩu</title>
    <style>
  body { margin:0; padding:0; background-color:#f4f6f8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
  .container { width:100%; max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
  .header { padding:20px; text-align:center; background:linear-gradient(90deg,#1e90ff,#3fb0ff); color:#fff; }
  .preheader { display:none !important; visibility:hidden; opacity:0; height:0; width:0; }
  .content { padding:28px; color:#333333; line-height:1.5; }
  .btn { display:inline-block; padding:12px 20px; border-radius:6px; text-decoration:none; font-weight:600; }
  .btn-primary { background:#1e90ff; color:#ffffff; }
  .note { font-size:13px; color:#666666; margin-top:18px; }
  .footer { padding:18px; font-size:13px; color:#999999; text-align:center; }
  @media (max-width:420px){ .content { padding:18px; } .header{padding:14px} }
</style>
</head>
<body>
<!-- Preheader (hiện tóm tắt trong inbox) -->
<div class="preheader">Đặt lại mật khẩu cho tài khoản của bạn.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8; padding:28px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" class="container" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td class="header">
            <h1 style="margin:0; font-size:20px;">Đặt lại mật khẩu</h1>
          </td>
        </tr>
        <tr>
          <td class="content">
            <p style="margin:0 0 12px 0;">Chào <strong>${name}</strong>,</p>
            <p style="margin:0 0 18px 0;">
              Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trên <strong>TechZone</strong>. Vui lòng nhập mã dưới để đặt lại mật khẩu:
            </p>
            <h2
                style="font-size: 20px; font-weight: 700; line-height: 1.25; margin-top: 0; margin-bottom: 15px; text-align: center;">
                ${codeID}</h2>
            <p class="note">
              Lưu ý: Mã này có hiệu lực trong <strong>5 phút</strong> kể từ khi gửi. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này — không có hành động nào khác cần thiết.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
    </html>`;
    const info = await this.transporter.sendMail({
      from,
      to,
      subject: 'Password Reset Request',
      html: emailHTML,
    });
    this.logger.log(`Sent password reset email to ${to} - ${info.messageId}`);
    return info;
  }

}
