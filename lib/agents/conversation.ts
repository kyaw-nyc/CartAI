import { callOpenAI } from '../api/openai-direct'
import { ChatMessage } from '@/types/negotiation'

export interface ConversationResponse {
  message: string
  needsMoreInfo: boolean
  missingFields: string[]
  readyForPriority: boolean
  extractedInfo: {
    product: string | null
    quantity: number | null
    budget: number | null
  }
}

/**
 * Conversation agent handles initial chat with user to understand their needs
 * Uses GPT-4o via your direct OpenAI API for best quality responses
 */
export async function handleConversation(
  userMessage: string,
  conversationHistory: ChatMessage[]
): Promise<ConversationResponse> {
  const historyText = conversationHistory
    .map((msg) => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n')

  const prompt = `You are CartAI, a friendly AI shopping assistant helping users find sustainable products.

Conversation History:
${historyText}

User just said: "${userMessage}"

Your job:
1. Ask clarifying questions to understand what they need (product type, quantity, budget, any preferences)
2. Be conversational, friendly, and concise (2-3 sentences max)
3. Extract information progressively
4. Once you have: product type, rough quantity, and ballpark budget → indicate ready for priority selection

Respond in JSON format:
{
  "message": "Your friendly response here",
  "needsMoreInfo": true/false,
  "missingFields": ["quantity", "budget"],
  "readyForPriority": false,
  "extractedInfo": {
    "product": "bamboo toothbrushes" or null,
    "quantity": 50 or null,
    "budget": 100 or null
  }
}

IMPORTANT: Be friendly and natural. Don't ask for ALL info at once. Extract progressively.`

  // Conversation uses GPT-4o (your direct OpenAI API for best quality)
  const response = await callOpenAI(prompt, {
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 500,
  })

  if (!response.success || !response.content || !response.content.trim()) {
    return {
      message: "I'm here to help you find sustainable products! What are you looking for?",
      needsMoreInfo: true,
      missingFields: ['product', 'quantity', 'budget'],
      readyForPriority: false,
      extractedInfo: {
        product: null,
        quantity: null,
        budget: null,
      },
    }
  }

  try {
    // Parse JSON response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (!parsed.message || typeof parsed.message !== 'string' || parsed.message.trim().length === 0) {
        return {
          message: "I'm here to help you find sustainable products! What are you looking for?",
          needsMoreInfo: true,
          missingFields: parsed.missingFields || ['product', 'quantity', 'budget'],
          readyForPriority: parsed.readyForPriority ?? false,
          extractedInfo: parsed.extractedInfo || {
            product: null,
            quantity: null,
            budget: null,
          },
        }
      }
      return parsed as ConversationResponse
    }

    // Fallback if not JSON
    return {
      message: response.content,
      needsMoreInfo: true,
      missingFields: [],
      readyForPriority: false,
      extractedInfo: {
        product: null,
        quantity: null,
        budget: null,
      },
    }
  } catch (error) {
    console.error('Error parsing conversation response:', error)
    return {
      message: response.content || "Let's find you sustainable products! What are you shopping for?",
      needsMoreInfo: true,
      missingFields: [],
      readyForPriority: false,
      extractedInfo: {
        product: null,
        quantity: null,
        budget: null,
      },
    }
  }
}
