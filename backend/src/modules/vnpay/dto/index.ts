import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePaymentDTO {
    @IsNotEmpty({ message: 'orderID không được để trống' })
    @IsNumber({}, { message: 'orderID phải là số' })
    orderID: number;
}
