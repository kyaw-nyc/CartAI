import { callOpenRouter, OPENROUTER_MODELS, OpenRouterModel } from '../api/openrouter'
import { callOpenAI, OpenAIModel } from '../api/openai-direct'
import { SellerProfile } from '@/types/agent'
import { Offer } from '@/types/negotiation'
import { AIProvider } from '../api/ai-providers'

/**
 * Predefined seller profiles matching real Manhattan stores
 * Each store uses a different AI model
 */
export const SELLER_PROFILES: SellerProfile[] = [
  {
    id: 'store_hm',
    name: 'H&M',
    model: 'gpt-4o', // Your OpenAI API
    personality: {
      sustainabilityFocus: 'high',
      pricePoint: 'mid',
      negotiationFlexibility: 'medium',
    },
    inventory: {
      basePrice: 95,
      carbonFootprint: 15,
      deliveryDays: 3,
      certifications: ['Conscious Choice', 'Organic Cotton'],
    },
    tactics: [
      'Emphasize sustainable fashion collections',
      'Offer bulk discounts for larger orders',
      'Highlight fast fashion alternatives',
    ],
  },
  {
    id: 'store_zara',
    name: 'Zara',
    model: 'anthropic/claude-3.5-sonnet', // OpenRouter Anthropic
    personality: {
      sustainabilityFocus: 'medium',
      pricePoint: 'mid',
      negotiationFlexibility: 'low',
    },
    inventory: {
      basePrice: 110,
      carbonFootprint: 18,
      deliveryDays: 2,
      certifications: ['Join Life'],
    },
    tactics: [
      'Lead with trend-focused contemporary designs',
      'Emphasize speed and style',
      'Maintain premium positioning',
    ],
  },
  {
    id: 'store_hugo',
    name: 'Hugo Boss',
    model: 'deepseek/deepseek-chat', // OpenRouter DeepSeek (Sherlock alternative)
    personality: {
      sustainabilityFocus: 'medium',
      pricePoint: 'premium',
      negotiationFlexibility: 'low',
    },
    inventory: {
      basePrice: 150,
      carbonFootprint: 12,
      deliveryDays: 5,
      certifications: ['Responsible Wool', 'Sustainable Apparel Coalition'],
    },
    tactics: [
      'Emphasize premium quality and craftsmanship',
      'Highlight long-lasting durability',
      'Position as investment pieces',
    ],
  },
]

/**
 * Generate an offer from a seller based on their profile and negotiation context
 */
export async function generateSellerOffer(
  profile: SellerProfile,
  product: string,
  quantity: number,
  buyerMessage: string,
  roundNumber: number,
  provider: AIProvider
): Promise<Offer> {
  const providerAdjustments: Record<AIProvider, { priceMultiplier: number; carbonMultiplier: number; deliveryShift: number }> = {
    openrouter: { priceMultiplier: 1, carbonMultiplier: 1, deliveryShift: 0 },
    anthropic: { priceMultiplier: 0.96, carbonMultiplier: 1.07, deliveryShift: 1 },
    gemini: { priceMultiplier: 1.05, carbonMultiplier: 0.92, deliveryShift: -1 },
  }

  const variant = providerAdjustments[provider] || providerAdjustments.openrouter

  // Negotiation flexibility mapping
  const flexibilityMap = {
    very_high: 0.08, // 8% reduction per round
    high: 0.06,      // 6% reduction per round
    medium: 0.04,    // 4% reduction per round
    low: 0.02,       // 2% reduction per round
  }

  const flexibility = flexibilityMap[profile.personality.negotiationFlexibility]

  // Add seller stubbornness - randomly decides to hold firm or make smaller concessions
  const stubbornnessRoll = Math.random()
  let priceFactor: number

  if (stubbornnessRoll < 0.3) {
    // 30% chance: Seller holds firm or gives tiny concession
    priceFactor = 1 - roundNumber * flexibility * 0.3 // Only 30% of normal flexibility
  } else if (stubbornnessRoll < 0.6) {
    // 30% chance: Seller gives moderate concession
    priceFactor = 1 - roundNumber * flexibility * 0.7 // 70% of normal flexibility
  } else {
    // 40% chance: Seller negotiates normally
    priceFactor = 1 - roundNumber * flexibility
  }

  // Some sellers might actually INCREASE price in early rounds (testing buyer)
  if (roundNumber <= 2 && stubbornnessRoll < 0.15) {
    priceFactor = 1 + Math.random() * 0.05 // 0-5% price increase
  }

  const basePrice = Math.max(profile.inventory.basePrice * priceFactor, profile.inventory.basePrice * 0.75)
  const priceJitter = 0.97 + Math.random() * 0.06 // +/-3% jitter for variety
  const price = basePrice * variant.priceMultiplier * priceJitter

  // Adjust delivery for urgency, but sellers might refuse fast delivery
  let deliveryDays = profile.inventory.deliveryDays + variant.deliveryShift

  if (buyerMessage.toLowerCase().includes('urgent') || buyerMessage.toLowerCase().includes('fast')) {
    // 70% chance seller speeds up delivery, 30% chance they refuse
    if (Math.random() < 0.7) {
      deliveryDays = Math.max(1, deliveryDays - 2)
    } else {
      // Seller refuses to expedite
      deliveryDays = Math.max(deliveryDays, profile.inventory.deliveryDays)
    }
  }

  const carbonJitter = 0.98 + Math.random() * 0.04 // +/-2% jitter
  const carbon = profile.inventory.carbonFootprint * variant.carbonMultiplier * carbonJitter

  return {
    id: `offer_${profile.id}_${Date.now()}`,
    sellerId: profile.id,
    sellerName: profile.name,
    price: Math.round(price * quantity),
    carbonFootprint: Math.max(1, Math.round(carbon * quantity)),
    deliveryDays: Math.max(1, deliveryDays),
    certifications: profile.inventory.certifications,
  }
}

/**
 * Generate a seller's negotiation response message
 * Each seller uses a different AI model via OpenRouter for diversity and cost optimization
 */
export async function generateSellerResponse(
  profile: SellerProfile,
  product: string,
  quantity: number,
  buyerMessage: string,
  currentOffer: Offer,
  buyerName: string = 'Customer',
  model: OpenRouterModel = OPENROUTER_MODELS.GPT4O
): Promise<string> {
  const prompt = `You are ${profile.name}, a seller with these characteristics:
- Sustainability focus: ${profile.personality.sustainabilityFocus}
- Price point: ${profile.personality.pricePoint}
- Negotiation flexibility: ${profile.personality.negotiationFlexibility}
- Your current offer: $${currentOffer.price} total, ${currentOffer.carbonFootprint}kg CO₂, ${currentOffer.deliveryDays} days delivery
- Your certifications: ${currentOffer.certifications.join(', ') || 'None'}

Product: ${quantity} ${product}

Buyer (${buyerName}) said: "${buyerMessage}"

Respond as this seller in 1-2 sentences. You are a REAL business that needs to make profit.
- If flexibility is LOW, defend your price and push back on unreasonable requests
- If buyer is too demanding, politely but firmly hold your ground
- Highlight your unique value (quality, speed, sustainability) to justify your price
- Address buyer by "${buyerName}"
- Stay in character and be professional
Keep under 50 words. Sometimes refuse to budge on price if needed.`

  // Use direct OpenAI for GPT models, OpenRouter for others
  const isDirectOpenAI = !model.includes('/')
  const response = isDirectOpenAI
    ? await callOpenAI(prompt, { model: model as OpenAIModel, temperature: 0.6, maxTokens: 80 })
    : await callOpenRouter(prompt, {
        model,
        temperature: 0.6,
        maxTokens: 80,
        fallbackModel: OPENROUTER_MODELS.GPT4O_MINI,
      })

  if (!response.success || !response.content) {
    // Fallback response based on profile
    if (profile.personality.sustainabilityFocus === 'very_high') {
      return `Dear ${buyerName}, we offer premium sustainable ${product} with ${currentOffer.certifications.join(' & ')} certifications at $${currentOffer.price}.`
    } else if (profile.personality.pricePoint === 'budget') {
      return `Dear ${buyerName}, best price in the market - $${currentOffer.price} for ${quantity} units. Ready to ship in ${currentOffer.deliveryDays} days!`
    } else {
      return `Dear ${buyerName}, we can deliver ${quantity} ${product} in ${currentOffer.deliveryDays} day${currentOffer.deliveryDays > 1 ? 's' : ''} for $${currentOffer.price}.`
    }
  }

  return response.content
}
