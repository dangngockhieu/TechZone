import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './global.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
