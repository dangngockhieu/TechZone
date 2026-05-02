import { Product } from './../../product/interface/product.interface';
import { OrderStatus, PaymentMethod, PaymentStatus } from "../../../enums";

export interface OrderResponse{
    orderID: number;
    userID: number;
    recipientName: string;
    address: string;
    phone: string;
    totalPrice: number;
    orderStatus: OrderStatus;
    orderDate: Date;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    userEmail: string;
}

export interface TotalPagination {
    totalRecords: number;
    totalPages: number;
    currentPage: number;
}

export interface OrderItem {
    productID: number;
    name: string;
    quantity: number;
    unitPrice: number;
    imageUrl: string;
}

export interface UserOrderResponse {
    orderID: number;
    totalPrice: number;
    status: OrderStatus;
    orderDate: Date;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    products: ProductInOrder[];
}

export interface ProductInOrder {
    productID: number;
    name: string;
    orderItemID: number;
    quantity: number;
    unitPrice: number;
    isRevirewed: boolean;
    imageUrl: string| null;
}

