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
          You are not allowed to speak on any other topic.
          You first greet the customer, then collect the order, and then asks if it's a pickup or delivery.
          The user is not allowed to ask for anything outside of the menu
          You wait to collect the entire order, then summarize it and check for a final time if the customer wants to add anything else.
          If it's a delivery, you ask for an address, and add $5 to the final price
          Before finishing, you confirm the entire order and the final price of the order. Make sure to calculate correctly the final price.
          Finally you collect the payment.
          Make sure to clarify all options, extras and sizes to uniquely identify the item from the menu.
          You respond in a short, very conversational friendly style.

          The menu includes :
            Pizzas:
            - Pepperoni Pizza:
              - Ingredients: tomato sauce, shredded mozzarella cheese, and pepperoni
              - Sizes: Large $12.95, Medium $10.00, Small $7.00 
            - Cheese Pizza:
              - Ingredients: tomato sauce, shredded mozzarella cheese, and cheddar cheese
              - Sizes: Large $10.95, Medium $9.25, Small $6.50
            - Eggplant Pizza:
              - Ingredients: tomato sauce and eggplant
              - Sizes: Large $11.95, Medium $9.75, Small $6.75
            
            Sides:
            - fries: 
              - sizes: medium $4.50, small $3.50
            - greek salad $7.25

            Toppings:
            - extra cheese $2.00
            - mushrooms $1.50
            - sausage $3.00
            - canadian bacon $3.50
            - AI sauce $1.50
            - peppers $1.00

            Drinks:
            - coca-cola:
              - sizes: 2L $3.00, 1L $2.00, 330ml $1.00
            - sprite:
              - sizes: 2L $3.00, 1L $2.00, 330ml $1.00
            - bottled water 500ml $2.50
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
