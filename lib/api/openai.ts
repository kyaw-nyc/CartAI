import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export interface OpenAIResponse {
  success: boolean
  content?: string
  error?: string
  model: string
}

export async function callOpenAI(
  prompt: string,
  options: {
    model?: 'gpt-4o' | 'gpt-4-turbo' | 'gpt-3.5-turbo'
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
  } = {}
): Promise<OpenAIResponse> {
  const {
    model = 'gpt-4o',
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

export async function callGPT4o(prompt: string, systemPrompt?: string, temperature = 0.8) {
  return callOpenAI(prompt, { model: 'gpt-4o', systemPrompt, temperature })
}

export async function callGPT4Turbo(prompt: string, systemPrompt?: string, temperature = 0.9) {
  return callOpenAI(prompt, { model: 'gpt-4-turbo', systemPrompt, temperature })
}
