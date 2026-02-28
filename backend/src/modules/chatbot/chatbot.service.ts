import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { ChatResponseDTO } from './dto';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class ChatBotService implements OnModuleInit {
    private model: GenerativeModel;

    constructor(
        @Inject('DATABASE_POOL') private pool: Pool,
        private readonly configService: ConfigService
    ) {}

    onModuleInit() {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            console.error("LỖI: Chưa cấu hình GEMINI_API_KEY trong file .env");
            process.exit(1);
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        this.model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.7,
            }
        });
    }

    // Tạo phản hồi chat
    async generateChatResponse(question: string, productContext?: any[]): Promise<ChatResponseDTO> {
        try {
            const contextString = productContext && productContext.length > 0 
                ? JSON.stringify(productContext) 
                : "Không có dữ liệu sản phẩm.";

            const prompt = `
                VAI TRÒ: Bạn là Bitu - Trợ lý ảo bán hàng.
                CONTEXT: ${contextString}
                USER: "${question}"

                NHIỆM VỤ:
                1. Trả lời thân thiện (reply_message).
                2. Tìm sản phẩm phù hợp (suggested_products).

                YÊU CẦU ĐẦU RA (JSON chuẩn, không markdown):
                {
                    "reply_message": "Câu trả lời của bạn...",
                    "suggested_products": [
                        { 
                            "id": "...", 
                            "name": "...", 
                            "price": 0,   // Để dạng số nguyên
                            "image": "...", // URL ảnh
                            "reason": "Lý do ngắn gọn..." 
                        }
                    ]
                }
            `;

            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();
            
            // Clean JSON
            const cleanJson = responseText
                .replace(/^```json/g, '')
                .replace(/^```/g, '')
                .replace(/```$/g, '')
                .trim();
            
            return JSON.parse(cleanJson);

        } catch (error) {
            console.error("AI Error:", error);
            // Fallback để không crash app
            return {
                reply_message: "Bitu đang bận xíu, bạn hỏi lại sau nhé!",
                suggested_products: []
            };
        }
    }

    // Lấy lịch sử chat của người dùng
    async getChatHistory(userID: string) {
        const query = `
            SELECT * FROM "chat_messages" 
            WHERE "userID" = $1 
            ORDER BY "createdAt" ASC
        `;
        
        const result = await this.pool.query(query, [userID]);
        return result.rows;
    }

    // Lưu tin nhắn chat
    async saveChatMessage(
        userID: string,
        content: string,
        role: 'USER' | 'AI',
        productData?: any[]
    ) {
        const nowVN = dayjs().tz("Asia/Ho_Chi_Minh").toDate();
        
        const query = `
            INSERT INTO "chat_messages" ("userID", content, role, "createdAt", "productData")
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const values = [userID, content, role, nowVN, productData ? JSON.stringify(productData) : null];
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }
}

