import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common"
import { ChatGPTService } from "./chat-gpt.service"
import { OrderMessagesDto } from "./dto/order-messages.dto"
import { OrderMessagesResponseDto } from "./dto/order-messages-response.dto"

@Controller({ path: "pizza", version: "1" })
export class ChatGPTController {
  constructor(private readonly chatGPTService: ChatGPTService) {}

  @Post("order")
  @UsePipes(new ValidationPipe({ transform: true }))
  async order(
    @Body() orderMessagesDto: OrderMessagesDto,
  ): Promise<OrderMessagesResponseDto> {
    const content: string = await this.chatGPTService.getCompletionFromMessages(
      orderMessagesDto.messages,
    )
    return new OrderMessagesResponseDto({
      role: "assistant",
      content,
    })
  }
}
