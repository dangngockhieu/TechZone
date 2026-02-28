import { Injectable, Inject } from '@nestjs/common';
import { ConflictException, BadRequestException, NotFoundException, UnauthorizedException } from '../../help/exception';
import { Pool } from 'pg';
import * as argon from 'argon2';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class UserService {
    constructor(
        @Inject('DATABASE_POOL') private pool: Pool
    ) {}

    // Check email exists 
    async isEmailExist(email: string): Promise<boolean> {
        const query = 'SELECT id FROM "users" WHERE email = $1';
        const existingUser = await this.pool.query(query, [email]);
        
        if (existingUser.rows.length > 0) {
            return true;
        }
        return false;
    }

    // Find user by email 
    async findUserByEmail(email: string): Promise<any> {
        const query = 'SELECT * FROM "users" WHERE email = $1';
        const result = await this.pool.query(query, [email]);
        return result.rows[0];
    }

    // Get User With Paginateion 
    async getUserWithPaginate(page: number, limit: number, search: string) : Promise<{users: any[], total: number}> {
        const offset = (page - 1) * limit;
        let query1 = `
            SELECT id AS "userID", name, email, role
            FROM users
            WHERE "isVerified" = true
        `;

        let query2 = `
            SELECT COUNT(*) AS total
            FROM users
            WHERE "isVerified" = true
        `;
        
        const values1 = [];
        const values2 = [];
        let index = 1;

        if (search && search.trim() !== '') {
            query1 += ` AND ((name ILIKE $${index} OR email ILIKE $${index})) `;
            query2 += ` AND ((name ILIKE $${index} OR email ILIKE $${index})) `;
            values1.push(`%${search}%`);
            values2.push(`%${search}%`);
            index++;
        }
        // Phần paginate
        query1 += ` ORDER BY id DESC LIMIT $${index} OFFSET $${index + 1}`;
        values1.push(limit, offset);

        const result1 = await this.pool.query(query1, values1);
        const result2 = await this.pool.query(query2, values2);

        return {users: result1.rows, total: parseInt(result2.rows[0].total, 10)};
    }

    // CREATE USER (ADMIN)
    async postUserForAdmin (email: string, name: string, password: string, role: string): Promise<void> {
        const existingUser = await this.isEmailExist(email);
        if (existingUser) throw new ConflictException('Email đã được đăng ký!');
        const hashPassword = await argon.hash(password);
        const query = `
            INSERT INTO "users" (email, password, name, role, "isVerified")
            VALUES ($1, $2, $3, $4, true)
        `;
        await this.pool.query(query, [email, hashPassword, name, role]);
    };

    // CHANGE PASSWORD 
    async changePassword(email: string, oldPassword: string, newPassword: string) : Promise<void> {
        if (!email) {
            throw new UnauthorizedException('Không xác định được user. Thiếu token hoặc token không hợp lệ');
        }
        const user = await this.findUserByEmail(email);
        if (!user) throw new NotFoundException('Người dùng không tồn tại!');
        const isPasswordValid = await argon.verify(user.password, oldPassword);
        if (!isPasswordValid) throw new BadRequestException('Mật khẩu cũ không đúng!');
        const hashNewPassword = await argon.hash(newPassword);
        const query = `
            UPDATE "users"
            SET password = $1
            WHERE email = $2
        `;
        await this.pool.query(query, [hashNewPassword, email]);
    }

    // CHANGE ROLE USER
    async changeUserRole(userID: number, newRole: string) : Promise<void> {
        const query = `
            UPDATE "users"
            SET role = $1
            WHERE id = $2
        `;
        await this.pool.query(query, [newRole, userID]);
    }

    // Count Users 
    async countUsers(): Promise<number> {
        const query = 'SELECT COUNT(*) AS total FROM "users" WHERE "isVerified" = true';
        const result = await this.pool.query(query);
        return parseInt(result.rows[0].total, 10);
    }

    // Count This Month Users 
    async countThisMonthUsers(): Promise<number> {
        const vnNow = dayjs().tz("Asia/Ho_Chi_Minh").toDate();
        const startOfMonth = dayjs(vnNow).startOf('month').toDate();
        const endOfMonth = dayjs(vnNow).endOf('month').toDate();

        const query = `
            SELECT COUNT(*) AS total
            FROM "users"
            WHERE "isVerified" = true
            AND "sent_at" BETWEEN $1 AND $2
        `;
        const result = await this.pool.query(query, [startOfMonth, endOfMonth]);
        return parseInt(result.rows[0].total, 10);
    }
}