import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import type { ProductView } from "../interfaces";

export class ChatRequestDTO {
    @IsNotEmpty({ message: 'Vui lòng nhập câu hỏi!' })
    @IsString()
    question: string;

    @IsOptional()
    @IsArray()
    context?: ProductView[];
}

export class ProductSuggestion {
    id: string;
    name: string;
    price: number;
    image: string;
    reason: string;
}

export class ChatResponseDTO {
    reply_message: string;
    suggested_products: ProductSuggestion[];
}
