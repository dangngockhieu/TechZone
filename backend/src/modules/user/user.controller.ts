import { Controller, Get, Req, Post, Patch, Body} from "@nestjs/common";
import { UserService } from "./user.service";
import { Request } from "express";
import { CreateUserDTO, ChangePasswordDTO } from './dto';
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    // Get User With Paginateion 
    @Get('users-paginate')
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
    async createUserByAdmin(@Body() body: CreateUserDTO) {
        const { email, password, name, role } = body;
        await this.userService.postUserForAdmin(email, name, password, role);
        return {
            success: true,
            message: 'Tạo người dùng thành công'
        };
    }

    // CHANGE ROLE USER 
    @Patch('user-role/:id')
    async changeUserRole(@Req() req: Request) {
        const userID = +req.params.id;
        const newRole = req.body.role;
        await this.userService.changeUserRole(userID, newRole);
        return {
            success: true,
            message: 'Thay đổi vai trò người dùng thành công'
        };
    }
}