import { Injectable, Inject} from '@nestjs/common';
import { Pool } from 'pg';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { v4 as uuid4 } from 'uuid';
import * as dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../help/mail/mail.service';
import { UserService } from '../modules/user/user.service';
import { BadRequestException, NotFoundException, ConflictException, UnauthorizedException } from '../help/exception';

@Injectable()
export class AuthService {
    constructor(
        @Inject('DATABASE_POOL') private pool: Pool, 
        private jwt: JwtService, 
        private config: ConfigService,
        private mail: MailService,
        private readonly userService: UserService           
    ) {}

    // GỬI EMAIL XÁC THỰC 
    private async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
        const baseUrl = this.config.get<string>('VERIFY_BASE_URL');
        const separator = baseUrl.includes('?') ? '&' : '?';
        const verifyUrl = `${baseUrl}${separator}token=${token}&email=${encodeURIComponent(email)}`;
        await this.mail.sendVerificationEmail(email, name, verifyUrl);
    }

    // GỬI LẠI EMAIL XÁC THỰC 
    async resendVerificationEmail(email: string) : Promise<void>{
        if (!email) throw new BadRequestException('Email is required');
        const user = await this.userService.findUserByEmail(email)
        if (!user) throw new NotFoundException('User not found');
        if (user.isVerified) throw new BadRequestException('Email already verified');

        const lastSent = user.sent_at;
        const now = dayjs();
        if (lastSent) {
            const diffMinutes = now.diff(dayjs(lastSent), 'minutes');
            const waitMinutes = 5;
            const remaining = waitMinutes - diffMinutes;
            if (remaining > 0) {
                throw new BadRequestException(
                    `Bạn chỉ được yêu cầu gửi lại mã xác thực sau ${Math.ceil(remaining)} phút nữa.`,
                );
            }
        }

        await this.updateVerificationState(user.email, user.name);
    }

    // CẬP NHẬT TRẠNG THÁI XÁC THỰC 
    private async updateVerificationState(email: string, name: string) : Promise<void>{
        const token = uuid4();
        const refreshExpired = dayjs().add(30, 'minutes').toDate();
        const sentAt = dayjs().toDate();

        const query = `
            UPDATE "users" 
            SET verification_code = $1, sent_at = $2, code_expired = $3 
            WHERE email = $4`;
        await this.pool.query(query, [token, sentAt, refreshExpired, email]);
        
        await this.sendVerificationEmail(email, name, token);
    }
    
    // GỬI EMAIL QUÊN MẬT KHẨU 
    async sendPasswordResetEmail(email: string) : Promise<void> {
        if (!email) throw new BadRequestException('Email is required');
        const user = await this.userService.findUserByEmail(email);
        if (!user) throw new NotFoundException('User not found');
        if (user.isVerified === false)
            throw new BadRequestException('Account not verified');

        const lastSent = user.sent_at;
        const now = dayjs();
        if (lastSent) {
            const diffMinutes = now.diff(dayjs(lastSent), 'minutes');
            if (diffMinutes < 5) {
                throw new BadRequestException(
                    `Bạn chỉ được yêu cầu gửi lại mã xác thực sau ${5 - diffMinutes} phút nữa.`,
                );
            }
        }

        const codeID = uuid4();
        try {
            await this.mail.sendPasswordResetEmail(email, user.name, codeID);
            const query = `
                UPDATE "users" 
                SET verification_code = $1, sent_at = $2
                WHERE email = $3`;
            await this.pool.query(query, [codeID, dayjs().toDate(), email]);
        } catch {
            throw new BadRequestException('Failed to send password reset email');
        }
    }

    // TẠO TOKEN 
    private async generateToken(user: any): Promise<{ access_token: string; refresh_token: string }> {
        const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };

        const access_token = await this.jwt.signAsync(payload, {
            secret: this.config.get<string>('JWT_SECRET'),
            expiresIn: this.config.get<string>('JWT_EXPIRED') as any,
        });

        const refresh_token = await this.jwt.signAsync(payload, {
            secret: this.config.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get<string>('REFRESH_EXPIRED') as any,
        });

        return { access_token, refresh_token };
    }

    // ĐĂNG KÝ 
    async register(email: string, password: string, name: string ) : Promise<void>{
        // Kiểm tra email đã tồn tại chưa
        const existingUser = await this.userService.isEmailExist(email);
        if (existingUser) throw new ConflictException('Email đã được đăng ký!');

        const token = uuid4();
        const code_expired = dayjs().add(30, 'minutes').toDate();
        const sentAt = dayjs().toDate();
        const hashPassword = await argon.hash(password);

        // Insert vào Database
        const query = `
            INSERT INTO "users" (email, password, name, role, "isVerified", verification_code, code_expired, sent_at)
            VALUES ($1, $2, $3, 'USER', false, $4, $5, $6);
        `;

        await this.pool.query(query, [email, hashPassword, name, token, code_expired, sentAt]);
        try {
            await this.sendVerificationEmail(email, name, token);
        } catch (err) {
            console.error('Failed to send verification email', err);
            throw new BadRequestException('Đăng ký thất bại. Không thể gửi email xác thực, vui lòng thử lại sau.');
        }
    }

    // XÁC THỰC USER 
    async validateUser(email: string, password: string) : Promise<any> {
        const user = await this.userService.findUserByEmail(email);
        if (!user || !user.password || !user.isVerified) 
            throw new BadRequestException('Tài khhoản không tồn tại hoặc chưa được xác thực');
        const ok = await argon.verify(user.password, password);
        if (!ok) throw new BadRequestException('Sai mật khẩu');;
        return user;
    }

    // ĐĂNG NHẬP 
    async login(user: any) : Promise<{ access_token: string; refresh_token: string; user: any }> {
        const { access_token, refresh_token } = await this.generateToken(user);
        const hashed = await argon.hash(refresh_token);
        const query = `
            UPDATE "users" 
            SET refresh_token = $1
            WHERE id = $2`;
        await this.pool.query(query, [hashed, user.id]);
        return {
            access_token,
            refresh_token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                email: user.email,
            },
        };
    }

    // LOGOUT 
    async logout(email: string) : Promise<void> {
        const user = await this.userService.findUserByEmail(email);
        if (!user) throw new NotFoundException('User not found');
    
        const query = `
            UPDATE "users" 
            SET refresh_token = $1
            WHERE id = $2`;
        await this.pool.query(query, [null, user.id]);
    }

    // REFRESH TOKEN 
    async postrefresh_token(refresh_token: string) : Promise<{ access_token: string; user: any }> {
        let payload: any;
        try {
            payload = this.jwt.verify(refresh_token, {
                secret: this.config.get<string>('JWT_REFRESH_SECRET'),
            });
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        const user = await this.userService.findUserByEmail(payload.email);
    
        if (!user || !user.refresh_token)
            throw new UnauthorizedException('User not found or refresh token revoked');

        const isValid = await argon.verify(user.refresh_token, refresh_token);
        if (!isValid) throw new UnauthorizedException('Invalid refresh token');
        const payloadNew = { sub: user.id, email: user.email, name: user.name, role: user.role };
        const access_token = await this.jwt.signAsync(payloadNew, {
            secret: this.config.get<string>('JWT_SECRET'),
            expiresIn: this.config.get<string>('JWT_EXPIRED') as any,
        });

        return {
            access_token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                email: user.email,
            },
        };
    }

    // XÁC THỰC EMAIL 
    async verifyByToken(token: string, email: string) : Promise<void> {
        if (!token) throw new BadRequestException('Token missing');

        const user = await this.userService.findUserByEmail(email);
        if (!user) throw new BadRequestException('Invalid or expired token');

        if (user.verification_code !== token) {
            throw new BadRequestException('Invalid verification token');
        }

        if (user.code_expired && dayjs().isAfter(dayjs(user.code_expired))) {
            const deleteQuery = `
                DELETE FROM "users" 
                WHERE email = $1`;
            await this.pool.query(deleteQuery, [email]);
            throw new BadRequestException('Verification expired. Please register again.');
        }
        const updateQuery = `
                UPDATE "users" 
                SET "isVerified" = true, verification_code = NULL, code_expired = NULL, sent_at = NULL
                WHERE email = $1`;
        await this.pool.query(updateQuery, [email]);
    }

    // RESET MẬT KHẨU 
    async resetPassword(email: string, code: string, newPassword: string) : Promise<void> {
        const user = await this.userService.findUserByEmail(email)
        if (!user) throw new NotFoundException('User not found or invalid code');
        if (user.verification_code !== code) {
            throw new BadRequestException('Invalid reset code');
        }
        const hashPassword = await argon.hash(newPassword);
        const updateQuery = `
                UPDATE "users" 
                SET password = $1, verification_code = NULL, code_expired = NULL, sent_at = NULL
                WHERE id = $2`;
        await this.pool.query(updateQuery, [hashPassword, user.id]);
    }
}