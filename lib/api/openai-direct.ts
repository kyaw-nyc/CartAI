import OpenAI from 'openai'

/**
 * Direct OpenAI client using your own API key
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export interface OpenAIResponse {
  success: boolean
  content?: string
  error?: string
  model: string
  tokensUsed?: number
}

export type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo'

export async function callOpenAI(
  prompt: string,
  options: {
    model?: OpenAIModel
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
  } = {}
): Promise<OpenAIResponse> {
  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    maxTokens = 1000,
    systemPrompt,
  } = options

  try {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt })
    }

    messages.push({ role: 'user', content: prompt })

    const response = await openai.chat.completions.create({
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
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      model,
    }
  }
}
