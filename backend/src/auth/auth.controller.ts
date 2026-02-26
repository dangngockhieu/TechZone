import { Body, Controller, Get, Patch, Post, Query, Req, Res} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { RegisterDTO, LoginDTO, ResetPasswordDTO } from './dto';
import { Public } from './decorater/customize';
import { UnauthorizedException } from '../help/exception';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly config: ConfigService) {}

    // REGISTER 
    @Post('register')
    @Public()
    async register(@Body() body: RegisterDTO) {
      const { email, name, password } = body;
      await this.authService.register(email, password, name);
      return {
        success: true,
        message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
        data:{}
      };
    }

    // LOGIN 
    @Post('login')
    @Public()
    async login(@Body() body: LoginDTO, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
      const { email, password } = body;
      const user = await this.authService.validateUser(email, password);
      const data = await this.authService.login(user);
      const isProd = this.config.get<string>('NODE_ENV') === 'production';
      if (req.cookies?.refresh_token) {
        res.clearCookie('refresh_token', {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? 'none' : 'lax',
          path: '/',
          domain: isProd ? '.techzone.vn' : undefined
        });
      }
      res.cookie('refresh_token', data.refresh_token, {
        httpOnly: true,      
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        path: '/',
        domain: isProd ? '.techzone.vn' : undefined 
      });

      return {
        success: true,
        message: 'Login successful',
        data: {
          access_token: data.access_token,
          user: data.user
        }
      };
    }

    // LOGOUT 
    @Post('logout')
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
      const email = (req.user as any)?.email;
      if (!email) {
        throw new UnauthorizedException('No authenticated user found');
      }
      await this.authService.logout(email);
      const isProd = this.config.get<string>('NODE_ENV') === 'production';
      if (req.cookies?.refresh_token) {
        res.clearCookie('refresh_token', {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? 'none' : 'lax',
          path: '/',
          domain: isProd ? '.techzone.vn' : undefined  
        });
      }
      return {
        success: true,
        message: 'Logout successful',
        data:{}
      }
    }

    // REFRESH TOKEN 
    @Post('refresh-token')
    @Public()
    async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
      const refresh_token = req.cookies['refresh_token'];
      if (!refresh_token) {
        throw new UnauthorizedException('Missing refresh token');
      }
      const data = await this.authService.postrefresh_token(refresh_token);
      
      // Set lại refresh token vào cookie để đảm bảo cookie luôn fresh
      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });
      
      return {
        success: true,
        message: 'RefreshToken successful',
        data: {
          access_token: data.access_token,
          user: data.user,
        }
      };
    }

    // VERIFY EMAIL 
    @Get('verify')
    @Public()
    async verify(
      @Query('token') token: string,
      @Query('email') email: string,
      @Res() res: Response,
    ) {
      await this.authService.verifyByToken(token, email);
        
      res.send(`
        <!doctype html>
        <html lang="vi">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            <title>Đã xác thực email</title>
            <style>
              body { margin:0; padding:0; background:#f5f7fb; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif; color:#333; }
              .wrap { width:100%; max-width:600px; margin:28px auto; }
              .card { background:#fff; border-radius:12px; box-shadow:0 6px 18px rgba(16,24,40,0.06); overflow:hidden; }
              .hero { padding:28px; text-align:center; background:linear-gradient(90deg,#6ee7b7,#3b82f6); color:#04263a; }
              .hero h1 { margin:8px 0 0 0; font-size:20px; line-height:1.1; }
              .content { padding:26px; }
              .message { font-size:15px; line-height:1.6; color:#4b5563; margin:0 0 18px 0; }
              .meta { font-size:13px; color:#9ca3af; margin-top:16px; }
              .footer { padding:18px; text-align:center; font-size:13px; color:#9ca3af; }
              @media (max-width:420px){ .hero{padding:20px} .content{padding:18px} }
            </style>
          </head>
          <body>
            <div style="display:none;visibility:hidden;opacity:0;height:0;width:0;">Email của bạn đã được xác thực — bạn có thể đăng nhập ngay.</div>
            <div class="wrap">
              <div class="card" role="article" aria-roledescription="email">
                <div class="hero">
                  <div style="display:flex; align-items:center; justify-content:center; gap:12px;">
                    <div style="text-align:left;">
                      <div style="font-size:13px; color:rgba(4,38,58,0.85);">Xác thực thành công</div>
                      <h1>Email đã được xác thực</h1>
                    </div>
                  </div>
                </div>
                <div class="content">
                  <p class="message">
                    Cảm ơn bạn — địa chỉ email của bạn đã được xác thực thành công. Bây giờ bạn có thể đăng nhập và bắt đầu trải nghiệm mua sắm tại <strong>TechZone</strong>.
                  </p>
                  <p class="meta">
                    Nếu bạn không thực hiện yêu cầu này hoặc cần trợ giúp, hãy liên hệ: 
                    <a href="mailto:laptopshop8386@gmail.com">laptopshop8386@gmail.com</a>
                  </p>
                </div>
                <div style="border-top:1px solid #f1f5f9; padding:16px 24px; display:flex; justify-content:space-between; align-items:center;">
                  <div style="font-size:13px; color:#6b7280;">© <span id="year">2025</span> TechZone</div>
                  <div style="font-size:13px; color:#6b7280;">An toàn &amp; Bảo mật</div>
                </div>
              </div>
              <div class="footer">
                Chúc bạn một ngày tốt lành
              </div>
            </div>
          </body>
        </html>
      `);
    }

    // RESEND VERIFY EMAIL 
    @Post('resend')
    @Public()
    async resend(@Body('email') email: string) {
      await this.authService.resendVerificationEmail(email);
      return {
        success: true,
        message: 'Resend email successful',
        data:{}
      };
    }

    // SEND RESET PASSWORD 
    @Post('send-reset-password')
    @Public()
    async sendResetPassword(@Body('email') email: string) {
      await this.authService.sendPasswordResetEmail(email);
      return {
        success: true,
        message: 'Password reset email sent successfully',
        data:{}
      };
    }

    // RESET PASSWORD 
    @Patch('reset-password')
    @Public()
    async resetPassword(@Body() body: ResetPasswordDTO) {
      const { email, code, newPassword } = body;
      await this.authService.resetPassword(email, code, newPassword);
      return {
        success: true,
        message: 'Password reset successfully',
        data:{}
      };
    }
}
