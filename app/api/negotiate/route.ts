import { NextRequest } from 'next/server'
import { NegotiationOrchestrator, NegotiationUpdate } from '@/lib/agents/orchestrator'
import { Priority } from '@/types/product'
import { AIProvider } from '@/lib/api/ai-providers'

export const runtime = 'nodejs' // Need Node runtime for streaming

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product, quantity, priority, budget, userName, provider } = body as {
      product: string
      quantity: number
      priority: Priority
      budget: number
      userName?: string
      provider?: AIProvider
    }

    // Validation
    if (!product || !quantity || !priority || !budget) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Create a TransformStream for Server-Sent Events
    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Start negotiation in background
    ;(async () => {
      try {
        const orchestrator = new NegotiationOrchestrator(
          product,
          quantity,
          budget,
          priority,
          userName || 'Customer',
          async (update: NegotiationUpdate) => {
            // Stream each update to the client
            const data = `data: ${JSON.stringify(update)}\n\n`
            await writer.write(encoder.encode(data))
          },
          provider || 'openrouter'
        )

        await orchestrator.start()

        // Close the stream
        await writer.close()
      } catch (error) {
        console.error('Negotiation error:', error)
        const errorUpdate = {
          type: 'error',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        }
        await writer.write(encoder.encode(`data: ${JSON.stringify(errorUpdate)}\n\n`))
        await writer.close()
      }
    })()

    // Return the stream
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Negotiate API error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to start negotiation',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
