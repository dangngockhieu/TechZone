import {
  Body, Controller, Get, Post, Req
} from '@nestjs/common';
import { Request } from 'express';
import { ChatBotService } from './chatbot.service';
import { ChatRequestDTO } from './dto/chat.dto';
import { BadRequestException, UnauthorizedException, InternalServerErrorException } from '../../help/exception';


@Controller('chat')
export class ChatBotController {
    constructor(private readonly chatbotService: ChatBotService) {}

    @Post('ask')
    async handleChat(@Body() chatRequest: ChatRequestDTO, @Req() req: Request) {
        try {
            const { question, context } = chatRequest;
            const userID = (req as any).user?.id;

            if (!question) {
                throw new BadRequestException('Câu hỏi không được để trống.');
            }

            const aiResponse = await this.chatbotService.generateChatResponse(question, context);

            if (userID) {
                try {
                    // Lưu tin nhắn User
                    await this.chatbotService.saveChatMessage(userID, question, 'USER');

                    // Lưu tin nhắn AI
                    await this.chatbotService.saveChatMessage(
                        userID,
                        aiResponse.reply_message,
                        'AI',
                        aiResponse.suggested_products
                    );
                } catch (err) {
                    throw new InternalServerErrorException('Lỗi khi lưu lịch sử chat.');
                }
            }

            return {
                success: true,
                message: "Thành công",
                data:{
                    aiResponse: aiResponse
                }
            };

        } catch (error) {
            console.error("Lỗi Controller:", error);
            return {
                success: false,
                message: "Lỗi",
                data:{}
             };
        }
    }

    @Get('history')
    async getChatHistory(@Req() req: Request) {
        try {
            const userID = (req as any).user?.id;

            if (!userID) {
                throw new UnauthorizedException('Câu hỏi không được để trống.');
            }

            const history = await this.chatbotService.getChatHistory(userID);

            return {
                success: true,
                message: "Lấy lịch sử chat thành công.",
                data:{
                    history: history
                }
            };
        } catch (error) {
            console.error("Lỗi lấy lịch sử chat:", error);
            throw new InternalServerErrorException( "Lỗi hệ thống, vui lòng thử lại sau.");
        }
    }

}