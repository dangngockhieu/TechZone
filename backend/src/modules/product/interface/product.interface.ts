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