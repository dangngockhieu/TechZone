export * from './product.interface';
export * from './cart.interface';
export * from './order.interface';
export * from './user.interface';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}