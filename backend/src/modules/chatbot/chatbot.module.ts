import { ChatBotService } from './chatbot.service';
import { ChatBotController } from './chatbot.controller';
import { Module } from "@nestjs/common";

@Module({
    controllers: [ChatBotController],
    providers: [ChatBotService],
})
export class ChatBotModule {}