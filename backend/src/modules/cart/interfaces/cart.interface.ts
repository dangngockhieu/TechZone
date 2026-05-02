export interface CartItem{
    id: number;
    name: string;
    price: number;
    quantity: number;
    originalPrice: number;
    number: number;
    isSelected: boolean;
    imageUrl: string | null;
}