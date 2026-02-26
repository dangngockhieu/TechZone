import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDTO {
    @IsEmail({}, { message: 'Email không hợp lệ' }) 
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;
    @IsString()
    @IsNotEmpty({ message: 'Password không được để trống' })
    @MinLength(6)
    @MaxLength(30)
    password: string;
    @IsString()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    name: string;
    @IsString()
    @IsNotEmpty({ message: 'Role không được để trống' })
    role: string;
}

export class ChangePasswordDTO {
    @IsString()
    @IsNotEmpty({ message: 'Old Password không được để trống' })
    @MinLength(6)
    @MaxLength(30)
    oldPassword: string;
    @IsString()
    @IsNotEmpty({ message: 'New Password không được để trống' })
    @MinLength(6)
    @MaxLength(30)
    newPassword: string;
}