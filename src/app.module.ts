import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { ChatGPTModule } from "./chat-gpt/chat-gpt.module"
import { ConfigModule } from "@nestjs/config"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ChatGPTModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
