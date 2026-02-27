export interface OrderItem {
  productID: number;
  quantity: number;
  price: number;
}

export interface CreateOrderDTO {
  recipientName: string;
  address: string;
  phone: string;
  items: OrderItem[];
  totalPrice: number;
  paymentMethod: string;
}

export interface ProductDTO {
  productID: number;
}
export interface OrderDTO {
  products: ProductDTO[];
}

