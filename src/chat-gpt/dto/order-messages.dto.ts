import { IsArray } from "class-validator"
import { ChatCompletionMessageParam } from "openai/resources"

export class OrderMessagesDto {
  @IsArray()
  messages: ChatCompletionMessageParam[]
}
