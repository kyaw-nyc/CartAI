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
    const rounds = 4 // Reduced from 6 for faster negotiations
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
      // Seller generates offer and response in parallel
      const offer = await generateSellerOffer(
        seller,
        this.product,
        this.quantity,
        buyerInitialMessage,
        round,
        'openrouter' // Not used for single store
      )

      // Generate seller message and send offer update immediately in parallel
      const sellerMessagePromise = generateSellerResponse(
        seller,
        this.product,
        this.quantity,
        buyerInitialMessage,
        offer,
        this.userName,
        seller.model as any
      )

      currentOffer = offer

      // Send metrics update immediately (don't wait for message)
      const progress = Math.round((round / rounds) * 100)
      this.onUpdate({
        type: 'metric',
        data: {
          currentBest: offer,
          progress,
        },
      })

      // Wait for seller message to complete
      const sellerMessage = await sellerMessagePromise

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

      // Reduced delay between rounds for faster experience
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    // Determine negotiation outcome
    const finalOffer = currentOffer!
    const pricePerUnit = finalOffer.price / this.quantity
    const budgetPerUnit = this.budget

    // Calculate how well the buyer did
    const priceDiff = budgetPerUnit - pricePerUnit
    const priceRatio = pricePerUnit / budgetPerUnit

    let reasoning: string
    let whoWon: 'buyer' | 'seller' | 'fair'

    if (priceRatio <= 0.85) {
      // Buyer got a great deal (15%+ under budget)
      whoWon = 'buyer'
      reasoning = `Excellent negotiation! ${seller.name} agreed to $${finalOffer.price} (${Math.round((1 - priceRatio) * 100)}% under your budget). You saved $${Math.round(priceDiff * this.quantity)} with ${finalOffer.deliveryDays} days delivery and ${finalOffer.carbonFootprint}kg CO₂ footprint. ${seller.name} made concessions to win your business.`
    } else if (priceRatio <= 0.95) {
      // Fair negotiation (5-15% under budget)
      whoWon = 'fair'
      reasoning = `Good negotiation! ${seller.name} offered $${finalOffer.price} (${Math.round((1 - priceRatio) * 100)}% under budget). Fair deal with ${finalOffer.deliveryDays} days delivery and ${finalOffer.carbonFootprint}kg CO₂. Both parties made reasonable compromises.`
    } else if (priceRatio <= 1.05) {
      // Close to budget (within 5%)
      whoWon = 'fair'
      reasoning = `${seller.name} held firm at $${finalOffer.price} (near your $${Math.round(budgetPerUnit * this.quantity)} budget). They maintained their pricing but delivered on ${finalOffer.deliveryDays} days and ${finalOffer.carbonFootprint}kg CO₂. Market-rate deal.`
    } else if (priceRatio <= 1.15) {
      // Slightly over budget (5-15% over)
      whoWon = 'seller'
      reasoning = `${seller.name} stayed strong at $${finalOffer.price} (${Math.round((priceRatio - 1) * 100)}% over your ${budgetPerUnit * this.quantity} budget). They defended their premium pricing for ${finalOffer.deliveryDays}-day delivery and ${finalOffer.carbonFootprint}kg CO₂. Consider if the ${finalOffer.certifications.length > 0 ? 'certified quality' : 'quality'} justifies the premium.`
    } else {
      // Significantly over budget (15%+ over)
      whoWon = 'seller'
      reasoning = `${seller.name} held firm at $${finalOffer.price} (${Math.round((priceRatio - 1) * 100)}% over budget). They maintained premium pricing, betting on their ${this.priority === 'speed' ? `fast ${finalOffer.deliveryDays}-day delivery` : this.priority === 'carbon' ? `low ${finalOffer.carbonFootprint}kg carbon footprint` : 'quality and certifications'}. They won this negotiation by not backing down.`
    }

    const result: NegotiationResult = {
      winner: finalOffer,
      alternatives: [],
      reasoning,
      carbonSaved: 0,
      carbonSavedInMiles: 0,
      totalRounds: rounds,
      duration: 0, // Will be calculated by the caller
    }

    this.onUpdate({
      type: 'complete',
      data: { result },
    })
  }
}
