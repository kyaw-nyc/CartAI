import { NextRequest } from 'next/server'
import { SingleStoreOrchestrator } from '@/lib/agents/single-store-orchestrator'
import { Priority } from '@/types/product'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product, quantity, priority, budget, userName, storeId, buyerModel } = body as {
      product: string
      quantity: number
      priority: Priority
      budget: number
      userName?: string
      storeId: string
      buyerModel: string
    }

    console.log('[Single Store Negotiation] Starting:', { product, quantity, priority, budget, storeId, buyerModel })

    // Create a stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const orchestrator = new SingleStoreOrchestrator(
          product,
          quantity,
          budget,
          priority,
          userName || 'Customer',
          storeId,
          buyerModel,
          (update) => {
            // Send update to client
            const message = `data: ${JSON.stringify(update)}\n\n`
            controller.enqueue(encoder.encode(message))
          }
        )

        try {
          await orchestrator.run()
          controller.close()
        } catch (error) {
          console.error('[Single Store Negotiation] Error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[Single Store Negotiation] Fatal error:', error)
    return new Response(JSON.stringify({ error: 'Negotiation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
