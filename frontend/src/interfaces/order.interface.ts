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

export interface OrderState {
  orderID: number,
  userID: number,
  recipientName: string,
  address: string,
  phone: string,
  totalPrice: number,
  orderStatus: string,
  orderDate: string,
  trackingCode: string,
  deliveryDate: string,
  expectedDate: string | null,
  receivedDate: string,
  paymentMethod: string,
  paymentStatus: string,
  userEmail: string
}

export interface OrderViewDetail{
  productID: number,
  name: string,
  quantity: number,
  unitPrice: number,
  imageUrl: string | null
}

export interface ProductInOrder{
  productID: number,
  name: string,
  orderItemID: number,
  quantity: number,
  unitPrice: number,
  isReviewed: boolean,
  imageUrl: string | null
}

export interface HistoryOrder{
  orderID: number,
  totalPrice: number,
  status: string,
  orderDate: string,
  paymentMethod: string,
  paymentStatus: string,
  products: ProductInOrder[]
}

