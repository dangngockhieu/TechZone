import { Controller, Get, Req, Post, Patch, Body} from "@nestjs/common";
import { UserService } from "./user.service";
import { Request } from "express";
import { Roles } from "src/auth/decorater/roles";
import { CreateUserDTO, ChangePasswordDTO } from './dto';
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    // Get User With Paginateion 
    @Get('users-paginate')
    @Roles('ADMIN')
    async getUserWithPaginate( @Req() req: Request) {
        const { page, limit, search } = req.query;
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 10;

        const {users, total} = await this.userService.getUserWithPaginate(
            pageNumber,
            limitNumber,
            search ? String(search) : ''
        );

        return {
            success: true,
            message: 'Lấy danh sách người dùng thành công',
            data: {
                users: users,
                total: total
            }
        };
    }

    // ADMIN CREATE USER
    @Post('user')
    @Roles('ADMIN')
    async createUserByAdmin(@Body() body: CreateUserDTO) {
        const { email, password, name, role } = body;
        await this.userService.postUserForAdmin(email, name, password, role);
        return {
            success: true,
            message: 'Tạo người dùng thành công'
        };
    }

    // CHANGE PASSWORD 
    @Patch('change-password')
    async changePassword(@Req() req: Request, @Body() body:ChangePasswordDTO) {
        const email = (req.user as any)?.email;
        const { oldPassword, newPassword } = body;
        await this.userService.changePassword(email, oldPassword, newPassword);
        return {
            success: true,
            message: 'Đổi mật khẩu thành công'
        };
    }

    // CHANGE ROLE USER 
    @Patch('user-role/:id')
    @Roles('ADMIN')
    async changeUserRole(@Req() req: Request) {
        const userID = +req.params.id;
        const newRole = req.body.role;
        await this.userService.changeUserRole(userID, newRole);
        return {
            success: true,
            message: 'Thay đổi vai trò người dùng thành công'
        };
    }

    // Count Users 
    @Get('count')
    @Roles('ADMIN')
    async countUsers() {
        const totalUsers = await this.userService.countUsers();
        return {
            success: true,
            message: 'Lấy tổng số người dùng thành công',
            count:totalUsers
        };
    }

    // ==================== Count New Users This Month ====================
    @Get('count-this-month')
    @Roles('ADMIN')
    async countThisMonthUsers() {
        const totalThisMonthUsers = await this.userService.countThisMonthUsers();
        return {
            success: true,
            message: 'Lấy tổng số người dùng trong tháng thành công',
            count:totalThisMonthUsers
        };
    }
}