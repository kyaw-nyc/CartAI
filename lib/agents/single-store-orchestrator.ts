import { Priority } from '@/types/product'
import { AgentMessage, Offer, NegotiationResult } from '@/types/negotiation'
import { generateBuyerRequest, generateBuyerResponse, getBuyerConfig } from './buyer'
import { generateSellerOffer, generateSellerResponse, SELLER_PROFILES } from './sellers'

export interface NegotiationUpdate {
  type: 'message' | 'metric' | 'complete'
  data: {
    message?: AgentMessage
    currentBest?: Offer
    progress?: number
    result?: NegotiationResult
  }
}

/**
 * Single-store negotiation orchestrator
 * Negotiates with only the selected store
 */
export class SingleStoreOrchestrator {
  private product: string
  private quantity: number
  private budget: number
  private priority: Priority
  private userName: string
  private storeId: string
  private buyerModel: string
  private onUpdate: (update: NegotiationUpdate) => void

  constructor(
    product: string,
    quantity: number,
    budget: number,
    priority: Priority,
    userName: string,
    storeId: string,
    buyerModel: string,
    onUpdate: (update: NegotiationUpdate) => void
  ) {
    this.product = product
    this.quantity = quantity
    this.budget = budget
    this.priority = priority
    this.userName = userName
    this.storeId = storeId
    this.buyerModel = buyerModel
    this.onUpdate = onUpdate
  }

  async run() {
    const rounds = 6
    const seller = SELLER_PROFILES.find((s) => s.id === this.storeId)

    if (!seller) {
      throw new Error(`Store not found: ${this.storeId}`)
    }

    const buyerConfig = getBuyerConfig(this.priority, this.budget)

    // Generate buyer's initial request
    const buyerInitialMessage = await generateBuyerRequest(
      this.product,
      this.quantity,
      this.priority,
      buyerConfig,
      this.userName,
      this.buyerModel as any
    )

    this.onUpdate({
      type: 'message',
      data: {
        message: {
          id: Date.now().toString(),
          role: 'buyer',
          content: buyerInitialMessage,
          timestamp: new Date(),
          model: this.buyerModel,
        },
      },
    })

    let currentOffer: Offer | null = null

    // Negotiation rounds
    for (let round = 1; round <= rounds; round++) {
      // Seller generates offer and response
      const offer = await generateSellerOffer(
        seller,
        this.product,
        this.quantity,
        buyerInitialMessage,
        round,
        'openrouter' // Not used for single store
      )

      const sellerMessage = await generateSellerResponse(
        seller,
        this.product,
        this.quantity,
        buyerInitialMessage,
        offer,
        this.userName,
        seller.model as any
      )

      currentOffer = offer

      this.onUpdate({
        type: 'message',
        data: {
          message: {
            id: Date.now().toString(),
            role: 'seller',
            sellerName: seller.name,
            sellerId: seller.id,
            content: sellerMessage,
            timestamp: new Date(),
            model: seller.model as string,
            offer: offer,
          },
        },
      })

      const progress = Math.round((round / rounds) * 100)
      this.onUpdate({
        type: 'metric',
        data: {
          currentBest: offer,
          progress,
        },
      })

      // Buyer responds (except on last round)
      if (round < rounds) {
        const buyerResponse = await generateBuyerResponse(
          this.product,
          this.quantity,
          this.priority,
          buyerConfig,
          [offer],
          round,
          this.userName,
          this.buyerModel as any
        )

        this.onUpdate({
          type: 'message',
          data: {
            message: {
              id: Date.now().toString(),
              role: 'buyer',
              content: buyerResponse,
              timestamp: new Date(),
              model: this.buyerModel,
            },
          },
        })
      }

      // Small delay between rounds
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Final result
    const result: NegotiationResult = {
      winner: currentOffer!,
      alternatives: [],
      reasoning: `Negotiated with ${seller.name} using ${seller.model}. Final offer: $${currentOffer!.price} for ${this.quantity} ${this.product}, ${currentOffer!.deliveryDays} days delivery, ${currentOffer!.carbonFootprint}kg CO₂.`,
      savingsSummary: {
        moneyVsBudget: this.budget - currentOffer!.price / this.quantity,
        carbonVsAverage: 0,
        timeVsAverage: 0,
      },
    }

    this.onUpdate({
      type: 'complete',
      data: { result },
    })
  }
}
