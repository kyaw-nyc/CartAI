import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface GeminiResponse {
  success: boolean
  content?: string
  error?: string
  model: string
}

export async function callGemini(
  prompt: string,
  options: {
    model?: 'gemini-2.0-flash-exp' | 'gemini-1.5-flash-8b'
    temperature?: number
    maxTokens?: number
  } = {}
): Promise<GeminiResponse> {
  const { model = 'gemini-2.0-flash-exp', temperature = 0.7, maxTokens = 1000 } = options

  try {
    const genModel = genAI.getGenerativeModel({
      model,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    })

    const result = await genModel.generateContent(prompt)
    const response = result.response
    const text = response.text()

    return {
      success: true,
      content: text,
      model,
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      model,
    }
  }
}

export async function callGeminiFlash(prompt: string, temperature = 0.7) {
  return callGemini(prompt, { model: 'gemini-2.0-flash-exp', temperature })
}

export async function callGeminiPro(prompt: string, temperature = 0.8) {
  return callGemini(prompt, { model: 'gemini-2.0-flash-exp', temperature })
}
