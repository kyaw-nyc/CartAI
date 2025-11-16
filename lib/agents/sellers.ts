import { callOpenRouter, OPENROUTER_MODELS } from '../api/openrouter'
import { SellerProfile } from '@/types/agent'
import { Offer } from '@/types/negotiation'

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
  roundNumber: number
): Promise<Offer> {
  // Apply dynamic pricing based on negotiation round
  const priceFactor = 1 - roundNumber * 0.05 * (profile.personality.negotiationFlexibility === 'very_high' ? 1.5 : 1)
  const price = Math.max(profile.inventory.basePrice * priceFactor, profile.inventory.basePrice * 0.8)

  // Adjust delivery for urgency
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
 * Generate a seller's negotiation response message
 * Each seller uses a different AI model via OpenRouter for diversity and cost optimization
 */
export async function generateSellerResponse(
  profile: SellerProfile,
  product: string,
  quantity: number,
  buyerMessage: string,
  currentOffer: Offer,
  buyerName: string = 'Customer'
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

  // Different sellers use different AI models via OpenRouter
  let response

  if (profile.id === 'seller_eco_premium') {
    // EcoSupply: Premium seller uses GPT-4o (stable on OpenRouter)
    response = await callOpenRouter(prompt, {
      model: OPENROUTER_MODELS.GPT4O,
      temperature: 0.8,
    })
  } else if (profile.id === 'seller_fast_trader') {
    // QuickShip: Use GPT-4o Mini (fast + cheaper) to avoid unsupported Gemini endpoints
    response = await callOpenRouter(prompt, {
      model: OPENROUTER_MODELS.GPT4O_MINI,
      temperature: 0.8,
    })
  } else {
    // ValueGreen: Budget seller uses GPT-4o Mini (cheap but effective)
    response = await callOpenRouter(prompt, {
      model: OPENROUTER_MODELS.GPT4O_MINI,
      temperature: 0.8,
    })
  }

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
