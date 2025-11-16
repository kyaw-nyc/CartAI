import { Priority } from '@/types/product'
import { Offer, NegotiationResult, AgentMessage } from '@/types/negotiation'
import { getBuyerConfig, generateBuyerRequest, generateBuyerResponse } from './buyer'
import { SELLER_PROFILES, generateSellerOffer, generateSellerResponse } from './sellers'
import { callOpenRouter, OPENROUTER_MODELS } from '../api/openrouter'
import { getIndustryAverage, calculateCarbonSavings, carbonToMiles } from '../utils/carbon'

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
 * Main orchestrator for multi-agent negotiation
 * Coordinates buyer and seller agents through negotiation rounds
 */
export class NegotiationOrchestrator {
  private product: string
  private quantity: number
  private budget: number
  private priority: Priority
  private userName: string
  private totalRounds = 6
  private currentRound = 0
  private allOffers: Offer[] = []
  private messages: AgentMessage[] = []
  private onUpdate: (update: NegotiationUpdate) => void

  constructor(
    product: string,
    quantity: number,
    budget: number,
    priority: Priority,
    userName: string,
    onUpdate: (update: NegotiationUpdate) => void
  ) {
    this.product = product
    this.quantity = quantity
    this.budget = budget
    this.priority = priority
    this.userName = userName
    this.onUpdate = onUpdate
  }

  /**
   * Start the negotiation process
   */
  async start(): Promise<NegotiationResult> {
    const startTime = Date.now()
    const buyerConfig = getBuyerConfig(this.priority, this.budget)

    // Round 1: Buyer makes initial request
    this.currentRound = 1
    const initialRequest = await generateBuyerRequest(this.product, this.quantity, this.priority, buyerConfig, this.userName)

    this.addMessage('buyer', initialRequest)
    this.sendUpdate('message', { message: this.messages[this.messages.length - 1] })

    // Small delay for UX
    await this.delay(500)

    // Sellers respond with initial offers
    for (const profile of SELLER_PROFILES) {
      const offer = await generateSellerOffer(profile, this.product, this.quantity, initialRequest, this.currentRound)

      const response = await generateSellerResponse(profile, this.product, this.quantity, initialRequest, offer, this.userName)

      this.allOffers.push(offer)
      this.addMessage('seller', response, profile.id, profile.name)
      this.sendUpdate('message', { message: this.messages[this.messages.length - 1] })

      await this.delay(300)
    }

    // Update metrics after first round
    const currentBest = this.getBestOffer()
    this.sendUpdate('metric', {
      currentBest,
      progress: (this.currentRound / this.totalRounds) * 100,
    })

    await this.delay(800)

    // Rounds 2-6: Negotiation back and forth
    for (let round = 2; round <= this.totalRounds; round++) {
      this.currentRound = round

      // Buyer responds strategically
      const buyerResponse = await generateBuyerResponse(
        this.product,
        this.quantity,
        this.priority,
        buyerConfig,
        this.allOffers,
        round,
        this.userName
      )

      this.addMessage('buyer', buyerResponse)
      this.sendUpdate('message', { message: this.messages[this.messages.length - 1] })

      await this.delay(500)

      // Sellers counter with improved offers
      for (const profile of SELLER_PROFILES) {
        const improvedOffer = await generateSellerOffer(
          profile,
          this.product,
          this.quantity,
          buyerResponse,
          this.currentRound
        )

        const response = await generateSellerResponse(profile, this.product, this.quantity, buyerResponse, improvedOffer, this.userName)

        this.allOffers.push(improvedOffer)
        this.addMessage('seller', response, profile.id, profile.name)
        this.sendUpdate('message', { message: this.messages[this.messages.length - 1] })

        await this.delay(300)
      }

      // Update metrics
      const best = this.getBestOffer()
      this.sendUpdate('metric', {
        currentBest: best,
        progress: (round / this.totalRounds) * 100,
      })

      await this.delay(600)
    }

    // Final decision
    const result = await this.makeFinalDecision(Date.now() - startTime)

    this.sendUpdate('complete', { result })

    return result
  }

  /**
   * Make final decision using GPT-4 Turbo for deep analysis
   */
  private async makeFinalDecision(duration: number): Promise<NegotiationResult> {
    const winner = this.getBestOffer()

    // Get alternatives (2nd and 3rd best)
    const alternatives = this.getAlternatives(winner)

    // Calculate carbon savings
    const industryAverage = getIndustryAverage(this.product)
    const carbonSaved = calculateCarbonSavings(winner.carbonFootprint / this.quantity, industryAverage)
    const carbonSavedInMiles = carbonToMiles(carbonSaved * this.quantity)

    // Generate AI reasoning
    const reasoning = await this.generateReasoning(winner, alternatives)

    return {
      winner,
      reasoning,
      carbonSaved: carbonSaved * this.quantity,
      carbonSavedInMiles,
      alternatives,
      totalRounds: this.totalRounds,
      duration: Math.round(duration / 1000), // Convert to seconds
    }
  }

  /**
   * Generate explanation for why this offer won
   */
  private async generateReasoning(winner: Offer, alternatives: Offer[]): Promise<string> {
    const prompt = `You are explaining a purchasing decision to a user who prioritized "${this.priority}".

Winning offer: ${winner.sellerName}
- Price: $${winner.price}
- Carbon: ${winner.carbonFootprint}kg CO₂
- Delivery: ${winner.deliveryDays} days
- Certifications: ${winner.certifications.join(', ') || 'None'}

Alternatives considered:
${alternatives.map((o) => `${o.sellerName}: $${o.price}, ${o.carbonFootprint}kg CO₂, ${o.deliveryDays} days`).join('\n')}

Explain in 2-3 sentences why ${winner.sellerName} won based on the "${this.priority}" priority.
Be specific about trade-offs. Keep it under 80 words.`

    // Final decision uses Claude Opus (highest quality reasoning)
    const response = await callOpenRouter(prompt, {
      model: OPENROUTER_MODELS.CLAUDE_OPUS,
      temperature: 0.9,
    })

    if (!response.success || !response.content) {
      // Intelligent fallback
      if (this.priority === 'speed') {
        return `${winner.sellerName} won with the fastest delivery time of ${winner.deliveryDays} day${winner.deliveryDays > 1 ? 's' : ''}, meeting your urgent needs while maintaining reasonable pricing.`
      } else if (this.priority === 'carbon') {
        return `${winner.sellerName} had the lowest carbon footprint at ${winner.carbonFootprint}kg CO₂ with verified ${winner.certifications.join(' and ')} certifications, making it the most sustainable choice.`
      } else {
        return `${winner.sellerName} offered the best value at $${winner.price}, saving you money while meeting delivery requirements and maintaining quality standards.`
      }
    }

    return response.content
  }

  /**
   * Get best offer based on priority
   */
  private getBestOffer(): Offer {
    // Get latest offers from each seller
    const latestOffers = this.getLatestOffers()

    if (this.priority === 'speed') {
      return latestOffers.reduce((best, current) => (current.deliveryDays < best.deliveryDays ? current : best))
    } else if (this.priority === 'carbon') {
      return latestOffers.reduce((best, current) => (current.carbonFootprint < best.carbonFootprint ? current : best))
    } else {
      return latestOffers.reduce((best, current) => (current.price < best.price ? current : best))
    }
  }

  /**
   * Get latest offers from each seller
   */
  private getLatestOffers(): Offer[] {
    const sellerIds = SELLER_PROFILES.map((p) => p.id)
    return sellerIds.map((sellerId) => {
      const sellerOffers = this.allOffers.filter((o) => o.sellerId === sellerId)
      return sellerOffers[sellerOffers.length - 1] // Latest offer
    })
  }

  /**
   * Get alternative offers (2nd and 3rd best)
   */
  private getAlternatives(winner: Offer): Offer[] {
    const latestOffers = this.getLatestOffers().filter((o) => o.id !== winner.id)

    if (this.priority === 'speed') {
      return latestOffers.sort((a, b) => a.deliveryDays - b.deliveryDays).slice(0, 2)
    } else if (this.priority === 'carbon') {
      return latestOffers.sort((a, b) => a.carbonFootprint - b.carbonFootprint).slice(0, 2)
    } else {
      return latestOffers.sort((a, b) => a.price - b.price).slice(0, 2)
    }
  }

  /**
   * Add message to history
   */
  private addMessage(role: 'buyer' | 'seller', content: string, sellerId?: string, sellerName?: string) {
    const message: AgentMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
      sellerId,
      sellerName,
    }
    this.messages.push(message)
  }

  /**
   * Send update to frontend
   */
  private sendUpdate(type: NegotiationUpdate['type'], data: NegotiationUpdate['data']) {
    this.onUpdate({ type, data })
  }

  /**
   * Simple delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
