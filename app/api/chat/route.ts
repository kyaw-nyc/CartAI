import { NextRequest, NextResponse } from 'next/server'
import { handleConversation } from '@/lib/agents/conversation'
import { ChatMessage } from '@/types/negotiation'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory } = body as {
      message: string
      conversationHistory: ChatMessage[]
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Call conversation agent
    const response = await handleConversation(message, conversationHistory || [])

    return NextResponse.json(response)
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
