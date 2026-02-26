import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDTO {
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
}

export class LoginDTO {
    @IsEmail({}, { message: 'Email không hợp lệ' }) 
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;
    @IsString()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @MinLength(6)
    @MaxLength(30)
    password: string;
}

export class ResetPasswordDTO {
    @IsEmail({}, { message: 'Email không hợp lệ' }) 
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;
    @IsString()
    @IsNotEmpty({ message: 'Code không được để trống' })
    code: string;
    @IsString()
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @MinLength(6)
    @MaxLength(30)
    newPassword: string;
}