import { Module } from "@nestjs/common"
import { ChatGPTProvider } from "./chat-gpt.provider"
import { ConfigService } from "@nestjs/config"
import { ChatGPTController } from "./chat-gpt.controller"
import { ChatGPTService } from "./chat-gpt.service"

@Module({
  controllers: [ChatGPTController],
  providers: [ChatGPTService, ChatGPTProvider, ConfigService],
})
export class ChatGPTModule {}
