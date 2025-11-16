import { callOpenRouter, OPENROUTER_MODELS, OpenRouterModel } from '../api/openrouter'
import { callOpenAI, OpenAIModel } from '../api/openai-direct'
import { SellerProfile } from '@/types/agent'
import { Offer } from '@/types/negotiation'
import { AIProvider } from '../api/ai-providers'

/**
 * Predefined seller profiles with different characteristics
 */
export const SELLER_PROFILES: SellerProfile[] = [
  {
    id: 'seller_eco_premium',
    name: 'EcoSupply',
    model: 'gpt-4o',
    personality: {
      sustainabilityFocus: 'very_high',
      pricePoint: 'premium',
      negotiationFlexibility: 'medium',
    },
    inventory: {
      basePrice: 120,
      carbonFootprint: 12,
      deliveryDays: 5,
      certifications: ['B-Corp', 'Carbon-Neutral', 'Fair Trade'],
    },
    tactics: [
      'Emphasize quality and certifications',
      'Provide detailed carbon breakdowns',
      'Willing to slightly reduce price for bulk orders',
    ],
  },
  {
    id: 'seller_fast_trader',
    name: 'QuickShip',
    model: 'gpt-4o',
    personality: {
      sustainabilityFocus: 'medium',
      pricePoint: 'mid',
      negotiationFlexibility: 'very_high',
    },
    inventory: {
      basePrice: 95,
      carbonFootprint: 18,
      deliveryDays: 1,
      certifications: ['ISO-14001'],
    },
    tactics: [
      'Lead with speed and convenience',
      'Aggressive price matching',
      'Offer tiered delivery options',
    ],
  },
  {
    id: 'seller_budget',
    name: 'ValueGreen',
    model: 'gpt-4o',
    personality: {
      sustainabilityFocus: 'low',
      pricePoint: 'budget',
      negotiationFlexibility: 'very_high',
    },
    inventory: {
      basePrice: 75,
      carbonFootprint: 22,
      deliveryDays: 10,
      certifications: [],
    },
    tactics: [
      'Undercut all competitors on price',
      'Bulk discount offers',
      'Fast to respond and adapt',
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

  // Apply dynamic pricing based on negotiation round
  const priceFactor = 1 - roundNumber * 0.05 * (profile.personality.negotiationFlexibility === 'very_high' ? 1.5 : 1)
  const basePrice = Math.max(profile.inventory.basePrice * priceFactor, profile.inventory.basePrice * 0.8)
  const priceJitter = 0.97 + Math.random() * 0.06 // +/-3% jitter for variety
  const price = basePrice * variant.priceMultiplier * priceJitter

  // Adjust delivery for urgency
  const deliveryAdjustment = buyerMessage.toLowerCase().includes('urgent') || buyerMessage.toLowerCase().includes('fast')
    ? Math.max(1, profile.inventory.deliveryDays - 2)
    : profile.inventory.deliveryDays
  const deliveryDays = Math.max(1, deliveryAdjustment + variant.deliveryShift)

  const carbonJitter = 0.98 + Math.random() * 0.04 // +/-2% jitter
  const carbon = profile.inventory.carbonFootprint * variant.carbonMultiplier * carbonJitter

  return {
    id: `offer_${profile.id}_${Date.now()}`,
    sellerId: profile.id,
    sellerName: profile.name,
    price: Math.round(price * quantity),
    carbonFootprint: Math.max(1, Math.round(carbon * quantity)),
    deliveryDays,
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
- Your current offer: $${currentOffer.price} total, ${currentOffer.carbonFootprint}kg CO₂, ${currentOffer.deliveryDays} days delivery
- Your certifications: ${currentOffer.certifications.join(', ') || 'None'}

Product: ${quantity} ${product}

Buyer (${buyerName}) said: "${buyerMessage}"

Respond as this seller in 1-2 sentences. Address the buyer by their name "${buyerName}". Be strategic, stay in character, and highlight your strengths.
Keep it under 50 words. Be persuasive but not pushy.`

  // Use direct OpenAI for GPT models, OpenRouter for others
  const isDirectOpenAI = !model.includes('/')
  const response = isDirectOpenAI
    ? await callOpenAI(prompt, { model: model as OpenAIModel, temperature: 0.8 })
    : await callOpenRouter(prompt, {
        model,
        temperature: 0.8,
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
