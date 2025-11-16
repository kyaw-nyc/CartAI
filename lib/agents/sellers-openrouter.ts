/**
 * EXAMPLE: Seller agents using OpenRouter
 * This shows how to use different AI models for different sellers
 * to save costs and explore different AI capabilities
 */

import { callOpenRouter, OPENROUTER_MODELS, callOpenRouterWithFallback } from '../api/openrouter'
import { SellerProfile } from '@/types/agent'
import { Offer } from '@/types/negotiation'

/**
 * Example seller profiles using OpenRouter models
 */
export const SELLER_PROFILES_OPENROUTER: SellerProfile[] = [
  {
    id: 'seller_eco_premium',
    name: 'EcoSupply',
    model: 'gpt-4o', // Can use any OpenRouter model
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
 * Generate seller offer (same as before)
 */
export async function generateSellerOfferOpenRouter(
  profile: SellerProfile,
  product: string,
  quantity: number,
  buyerMessage: string,
  roundNumber: number
): Promise<Offer> {
  const priceFactor = 1 - roundNumber * 0.05 * (profile.personality.negotiationFlexibility === 'very_high' ? 1.5 : 1)
  const price = Math.max(profile.inventory.basePrice * priceFactor, profile.inventory.basePrice * 0.8)

  const deliveryAdjustment = buyerMessage.toLowerCase().includes('urgent') || buyerMessage.toLowerCase().includes('fast')
    ? Math.max(1, profile.inventory.deliveryDays - 2)
    : profile.inventory.deliveryDays

  return {
    id: `offer_${profile.id}_${Date.now()}`,
    sellerId: profile.id,
    sellerName: profile.name,
    price: Math.round(price * quantity),
    carbonFootprint: profile.inventory.carbonFootprint * quantity,
    deliveryDays: deliveryAdjustment,
    certifications: profile.inventory.certifications,
  }
}

/**
 * STRATEGY 1: Different models for different sellers
 * Premium seller uses GPT-4, budget sellers use cheaper models
 */
export async function generateSellerResponseStrategy1(
  profile: SellerProfile,
  product: string,
  quantity: number,
  buyerMessage: string,
  currentOffer: Offer
): Promise<string> {
  const prompt = `You are ${profile.name}, a seller with these characteristics:
- Sustainability focus: ${profile.personality.sustainabilityFocus}
- Price point: ${profile.personality.pricePoint}
- Your current offer: $${currentOffer.price} total, ${currentOffer.carbonFootprint}kg CO₂, ${currentOffer.deliveryDays} days delivery
- Your certifications: ${currentOffer.certifications.join(', ') || 'None'}

Product: ${quantity} ${product}

Buyer said: "${buyerMessage}"

Respond as this seller in 1-2 sentences. Be strategic, stay in character, and highlight your strengths.
Keep it under 50 words. Be persuasive but not pushy.`

  // Premium seller = GPT-4o (most capable)
  if (profile.personality.pricePoint === 'premium') {
    const response = await callOpenRouter(prompt, {
      model: OPENROUTER_MODELS.GPT4O,
      temperature: 0.8,
    })
    return response.content || getFallbackResponse(profile, currentOffer, quantity, product)
  }

  // Mid-tier seller = Claude Haiku (fast + cheap)
  if (profile.personality.pricePoint === 'mid') {
    const response = await callOpenRouter(prompt, {
      model: OPENROUTER_MODELS.CLAUDE_HAIKU,
      temperature: 0.8,
    })
    return response.content || getFallbackResponse(profile, currentOffer, quantity, product)
  }

  // Budget seller = Free model (Mythomax)
  const response = await callOpenRouter(prompt, {
    model: OPENROUTER_MODELS.MYTHOMAX,
    temperature: 0.8,
  })
  return response.content || getFallbackResponse(profile, currentOffer, quantity, product)
}

/**
 * STRATEGY 2: Use fallback models for reliability
 * Try GPT-4o, fall back to Claude if it fails
 */
export async function generateSellerResponseWithFallback(
  profile: SellerProfile,
  product: string,
  quantity: number,
  buyerMessage: string,
  currentOffer: Offer
): Promise<string> {
  const prompt = `You are ${profile.name}, a seller with these characteristics:
- Sustainability focus: ${profile.personality.sustainabilityFocus}
- Price point: ${profile.personality.pricePoint}
- Your current offer: $${currentOffer.price} total, ${currentOffer.carbonFootprint}kg CO₂, ${currentOffer.deliveryDays} days delivery
- Your certifications: ${currentOffer.certifications.join(', ') || 'None'}

Product: ${quantity} ${product}

Buyer said: "${buyerMessage}"

Respond as this seller in 1-2 sentences. Be strategic, stay in character, and highlight your strengths.
Keep it under 50 words. Be persuasive but not pushy.`

  const response = await callOpenRouterWithFallback(prompt, {
    primaryModel: OPENROUTER_MODELS.GPT4O,
    fallbackModel: OPENROUTER_MODELS.CLAUDE_HAIKU,
    temperature: 0.8,
  })

  return response.content || getFallbackResponse(profile, currentOffer, quantity, product)
}

/**
 * STRATEGY 3: Mix of models for cost optimization
 * Use cheaper models for simple tasks, expensive for complex
 */
export async function generateSellerResponseCostOptimized(
  profile: SellerProfile,
  product: string,
  quantity: number,
  buyerMessage: string,
  currentOffer: Offer,
  roundNumber: number
): Promise<string> {
  const prompt = `You are ${profile.name}, a seller with these characteristics:
- Sustainability focus: ${profile.personality.sustainabilityFocus}
- Price point: ${profile.personality.pricePoint}
- Your current offer: $${currentOffer.price} total, ${currentOffer.carbonFootprint}kg CO₂, ${currentOffer.deliveryDays} days delivery
- Your certifications: ${currentOffer.certifications.join(', ') || 'None'}

Product: ${quantity} ${product}

Buyer said: "${buyerMessage}"

Respond as this seller in 1-2 sentences. Be strategic, stay in character, and highlight your strengths.
Keep it under 50 words. Be persuasive but not pushy.`

  // First 2 rounds: Use cheap models
  if (roundNumber <= 2) {
    const response = await callOpenRouter(prompt, {
      model: OPENROUTER_MODELS.GPT4O_MINI, // Cheapest GPT-4 variant
      temperature: 0.8,
    })
    return response.content || getFallbackResponse(profile, currentOffer, quantity, product)
  }

  // Later rounds: Use better models for complex negotiation
  const response = await callOpenRouter(prompt, {
    model: OPENROUTER_MODELS.GPT4O,
    temperature: 0.8,
  })
  return response.content || getFallbackResponse(profile, currentOffer, quantity, product)
}

/**
 * Fallback response if AI fails
 */
function getFallbackResponse(profile: SellerProfile, currentOffer: Offer, quantity: number, product: string): string {
  if (profile.personality.sustainabilityFocus === 'very_high') {
    return `We offer premium sustainable ${product} with ${currentOffer.certifications.join(' & ')} certifications at $${currentOffer.price}.`
  } else if (profile.personality.pricePoint === 'budget') {
    return `Best price in the market - $${currentOffer.price} for ${quantity} units. Ready to ship in ${currentOffer.deliveryDays} days!`
  } else {
    return `We can deliver ${quantity} ${product} in ${currentOffer.deliveryDays} day${currentOffer.deliveryDays > 1 ? 's' : ''} for $${currentOffer.price}.`
  }
}

/**
 * Example usage in orchestrator:
 *
 * import { generateSellerResponseStrategy1 } from './sellers-openrouter'
 *
 * const response = await generateSellerResponseStrategy1(
 *   profile,
 *   product,
 *   quantity,
 *   buyerResponse,
 *   improvedOffer
 * )
 */
