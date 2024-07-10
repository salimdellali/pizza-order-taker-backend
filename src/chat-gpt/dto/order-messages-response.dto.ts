import { ChatCompletionAssistantMessageParam } from "openai/resources"

export class OrderMessagesResponseDto {
  role: string
  content: string

  constructor(message: ChatCompletionAssistantMessageParam) {
    this.role = message.role
    this.content = message.content
  }
}
