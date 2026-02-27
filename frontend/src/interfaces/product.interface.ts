export interface ProductFilters {
  factories?: string[];
  product_features?: number[];
  price?: { min?: number; max?: number };
  specs?: {
    CPU?: string[];
    RAM?: string[];
    GPU?: string[];
    Storage?: string[];
    ScreenSize?: string[];
    PIN?: string[];
    Screen?: string[];
  };
}

export interface Product{
  name: string,
  originalPrice: number,
  quantity: number,
  coupon: number,
  // String fields
  warranty: string,
  infor: string,
  cpu: string,
  ram: string,
  storage: string,
  screen: string,
  graphicsCard: string,
  battery: string,
  weight: string,
  releaseYear: string,
  category: string,
  factory: string,
}

export interface BestSellerProduct{
  id: number;
  name: string;
  sold: number;
}

export interface ProductSummary {
  id: number,
  name: string,
  coupon: number,
  price: number,
  originalPrice: number,
  avgRating: string,
  totalReviews: string,
  imageUrls: string[],
}

export interface Feature {
  id: number;
  name: string;
}

export interface ProductImage {
  id: number;
  url: string;
}

export interface ProductPaginate{
  id: number,
  name: string,
  originalPrice: number,
  price: number,
  coupon: number,
  quantity: number,
  sold: number,
  warranty: string,
  infor: string,
  cpu: string,
  ram: string,
  storage: string,
  screen: string,
  graphicsCard: string,
  battery: string,
  weight: string,
  releaseYear: string,
  category: string,
  factory: string,
  images: ProductImage[],
  features: Feature[]
}

export interface ProductView{
  id: number,
  name: string,
  originalPrice: number,
  price: number,
  coupon: number,
  quantity: number,
  sold: number,
  warranty: string,
  infor: string,
  cpu: string,
  ram: string,
  storage: string,
  screen: string,
  graphicsCard: string,
  battery: string,
  weight: string,
  releaseYear: string,
  category: string,
  factory: string,
  images: string[],
  features: string[]
} 
export interface ProductAI{
  id: string,
  name: string,
  price: number,
  image: string,
  reason?: string
}

export interface ProductDetail{
  id: number,
  name: string,
  originalPrice: number,
  price: number,
  coupon: number,
  quantity: number,
  sold: number,
  warranty: string,
  infor: string,
  cpu: string,
  ram: string,
  storage: string,
  screen: string,
  graphicsCard: string,
  battery: string,
  weight: string,
  releaseYear: string,
  category: string,
  factory: string,
  avgRating: string,
  totalReviews: number,
  imageUrls: string[]
}

export interface Review{
  id: number,
  rating: number,
  comment: string,
  userName: string,
  createdAt: string
}