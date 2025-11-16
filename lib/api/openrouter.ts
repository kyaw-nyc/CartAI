import OpenAI from 'openai'

/**
 * OpenRouter client - Access 100+ AI models through a single API
 * Docs: https://openrouter.ai/docs/quickstart
 */
const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', // Optional, for rankings
    'X-Title': 'CartAI', // Optional, shows in OpenRouter rankings
  },
})

export interface OpenRouterResponse {
  success: boolean
  content?: string
  error?: string
  model: string
  tokensUsed?: number
  cost?: number
}

/**
 * Available models on OpenRouter
 * Full list: https://openrouter.ai/docs/models
 */
export const OPENROUTER_MODELS = {
  // OpenAI Models
  GPT4_TURBO: 'openai/gpt-4-turbo',
  GPT4O: 'openai/gpt-4o',
  GPT4O_MINI: 'openai/gpt-4o-mini',
  GPT35_TURBO: 'openai/gpt-3.5-turbo',

  // Anthropic Claude Models
  CLAUDE_OPUS: 'anthropic/claude-3-opus',
  CLAUDE_SONNET: 'anthropic/claude-3-sonnet',
  CLAUDE_HAIKU: 'anthropic/claude-3-haiku',

  // Google Gemini Models
  GEMINI_PRO: 'google/gemini-pro',
  GEMINI_FLASH: 'google/gemini-flash-1.5',

  // Meta Llama Models
  LLAMA_70B: 'meta-llama/llama-3-70b-instruct',
  LLAMA_8B: 'meta-llama/llama-3-8b-instruct',

  // Mistral Models
  MISTRAL_LARGE: 'mistralai/mistral-large',
  MISTRAL_MEDIUM: 'mistralai/mistral-medium',
  MIXTRAL_8X7B: 'mistralai/mixtral-8x7b-instruct',

  // Budget-Friendly Options
  MYTHOMAX: 'gryphe/mythomax-l2-13b', // Free
  NOUS_HERMES: 'nousresearch/nous-hermes-2-mixtral-8x7b-dpo', // Very cheap
} as const

export type OpenRouterModel = typeof OPENROUTER_MODELS[keyof typeof OPENROUTER_MODELS]

export async function callOpenRouter(
  prompt: string,
  options: {
    model?: OpenRouterModel
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
    fallbackModel?: OpenRouterModel
  } = {}
): Promise<OpenRouterResponse> {
  const {
    model = OPENROUTER_MODELS.GPT4O,
    temperature = 0.7,
    maxTokens = 1000,
    systemPrompt,
    fallbackModel,
  } = options

  try {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }

    messages.push({ role: 'user', content: prompt })

    const response = await openrouter.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    })

    const content = response.choices[0]?.message?.content || ''

    return {
      success: true,
      content,
      model,
      tokensUsed: response.usage?.total_tokens,
      // Note: OpenRouter doesn't return cost in response, but you can see it in dashboard
    }
  } catch (error) {
    console.error('OpenRouter API error:', error)
    // Try fallback model once if provided
    if (fallbackModel && fallbackModel !== model) {
      console.warn(`Retrying with fallback model ${fallbackModel}`)
      return callOpenRouter(prompt, {
        model: fallbackModel,
        temperature,
        maxTokens,
        systemPrompt,
      })
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      model,
    }
  }
}

/**
 * Helper functions for different use cases
 */

// For strategic negotiations - use GPT-4o
export async function callOpenRouterGPT4o(prompt: string, systemPrompt?: string, temperature = 0.8) {
  return callOpenRouter(prompt, {
    model: OPENROUTER_MODELS.GPT4O,
    systemPrompt,
    temperature,
  })
}

// For budget-friendly negotiations - use Claude Haiku (fast + cheap)
export async function callOpenRouterClaude(prompt: string, systemPrompt?: string, temperature = 0.8) {
  return callOpenRouter(prompt, {
    model: OPENROUTER_MODELS.CLAUDE_HAIKU,
    systemPrompt,
    temperature,
  })
}

// For FREE negotiations - use Mythomax (no cost!)
export async function callOpenRouterFree(prompt: string, systemPrompt?: string, temperature = 0.8) {
  return callOpenRouter(prompt, {
    model: OPENROUTER_MODELS.MYTHOMAX,
    systemPrompt,
    temperature,
  })
}

// For Gemini (if you want to try Google's models)
export async function callOpenRouterGemini(prompt: string, systemPrompt?: string, temperature = 0.7) {
  return callOpenRouter(prompt, {
    model: OPENROUTER_MODELS.GEMINI_FLASH,
    systemPrompt,
    temperature,
  })
}

/**
 * Multi-model strategy with fallback
 * Tries primary model, falls back to secondary if it fails
 */
export async function callOpenRouterWithFallback(
  prompt: string,
  options: {
    primaryModel: OpenRouterModel
    fallbackModel: OpenRouterModel
    systemPrompt?: string
    temperature?: number
  }
): Promise<OpenRouterResponse> {
  // Try primary model
  return callOpenRouter(prompt, {
    model: options.primaryModel,
    systemPrompt: options.systemPrompt,
    temperature: options.temperature,
    fallbackModel: options.fallbackModel,
  })
}
