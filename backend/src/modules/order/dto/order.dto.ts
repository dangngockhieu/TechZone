import { IsEnum, IsNotEmpty } from "class-validator";
import { PaymentMethod } from "../../../enums";

export class OrderItemDTO {
    @IsNotEmpty({ message: 'ID sản phẩm không được để trống' })
    productID: number;

    @IsNotEmpty({ message: 'Số lượng không được để trống' })
    quantity: number;

    @IsNotEmpty({ message: 'Giá không được để trống' })
    price: number;
}

export class CreateOrderDTO {
    @IsNotEmpty({ message: 'Tên người nhận không được để trống' })
    recipientName: string;

    @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
    address: string;

    @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
    phone: string;

    items: OrderItemDTO[];

    @IsNotEmpty({ message: 'Tổng giá không được để trống' })
    totalPrice: number;

    @IsEnum(PaymentMethod, { message: 'Phương thức thanh toán không hợp lệ' })
    paymentMethod: PaymentMethod;
}

export class ProductDTO {
    @IsNotEmpty({ message: 'ID sản phẩm không được để trống' })
    productID: number;
}
export class OrderDTO {
    @IsNotEmpty({ message: 'Danh sách sản phẩm không được để trống' })
    products: ProductDTO[];
}