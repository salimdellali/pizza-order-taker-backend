import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

@Injectable()
export class ChatGPTProvider {
  constructor(private readonly configService: ConfigService) {}

  getOpenAIApiKey() {
    return this.configService.get<string>("OPENAI_API_KEY")
  }
}
