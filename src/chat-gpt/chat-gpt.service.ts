import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common"
import { ChatGPTProvider } from "./chat-gpt.provider"
import { AuthenticationError, OpenAI, RateLimitError } from "openai"
import { OpenAIError } from "openai/error"
import { ChatCompletionMessageParam, ChatModel } from "openai/resources"

@Injectable()
export class ChatGPTService {
  constructor(private readonly chatGPTProvider: ChatGPTProvider) {}

  async getCompletionFromMessages(
    messages: ChatCompletionMessageParam[],
    model: ChatModel = "gpt-3.5-turbo",
    temperature = 0,
  ): Promise<string> {
    try {
      const openai = new OpenAI({
        apiKey: this.chatGPTProvider.getOpenAIApiKey(),
      })

      const setUpChatBotSystemMessage: ChatCompletionMessageParam = {
        role: "system",
        content: `
          You are Pizza AI, an automated service that collects orders for a pizza restaurant.
          You first greet the customer, then collects the order, and then asks if it's a pickup or delivery.
          You wait to collect the entire order, then summarize it and check for a final time if the customer wants to add anything else.
          If it's a delivery, you ask for an address.
          Before finishing, you confirm the entire order and the final price of the order.
          Finally you collect the payment.
          Make sure to clarify all options, extras and sizes to uniquely identify the item from the menu.
          You respond in a short, very conversational friendly style.
          The menu includes :
            Pizzas:
            - pepperoni pizza  12.95, 10.00, 7.00 
            - cheese pizza   10.95, 9.25, 6.50
            - eggplant pizza   11.95, 9.75, 6.75
            Sides:
            - fries 4.50, 3.50
            - greek salad 7.25
            Toppings:
            - extra cheese 2.00
            - mushrooms 1.50
            - sausage 3.00
            - canadian bacon 3.50
            - AI sauce 1.50
            - peppers 1.00
            Drinks:
            - coca-cola 3.00, 2.00, 1.00
            - sprite 3.00, 2.00, 1.00
            - bottled water 5.00
        `,
      }

      const initiateDiscussionAssistantMessage: ChatCompletionMessageParam = {
        role: "assistant",
        content: `
          Hi there! Welcome to our pizza restaurant. What can I get started for you today?\nWe have a variety of pizzas, sides, toppings, and drinks. Let me know what you'd like, and I'll help you with all the details.
        `,
      }

      const response = await openai.chat.completions.create({
        model,
        messages: [
          setUpChatBotSystemMessage,
          initiateDiscussionAssistantMessage,
          ...messages,
        ],
        temperature,
      })

      return response.choices[0].message.content
    } catch (error) {
      let errorMessage
      if (error instanceof OpenAIError) {
        errorMessage = "OpenAI Error"
        console.error(errorMessage, error)
        throw new InternalServerErrorException(errorMessage)
      }
      if (error instanceof AuthenticationError) {
        errorMessage = "Incorrect API key provided"
        console.error(errorMessage, error)
        throw new UnauthorizedException(errorMessage)
      }
      if (error instanceof RateLimitError) {
        errorMessage = "Too many requests"
        console.error(errorMessage, error)
        throw new UnauthorizedException(errorMessage)
      }
      errorMessage = "Unknown error"
      console.error(errorMessage, error)
      throw new InternalServerErrorException(errorMessage)
    }
  }
}
