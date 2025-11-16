import { callOpenRouter, OPENROUTER_MODELS, OpenRouterModel } from '../api/openrouter'
import { callOpenAI, OpenAIModel } from '../api/openai-direct'
import { SellerProfile } from '@/types/agent'
import { Offer } from '@/types/negotiation'
import { AIProvider } from '../api/ai-providers'
import { Priority } from '@/types/product'

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

type SellerModelTuning = {
  temperature: number
  maxTokens: number
}

// Per-seller model tuning so responses feel more distinct (and less likely to converge)
const SELLER_MODEL_TUNING: Record<string, SellerModelTuning> = {
  store_hm: { temperature: 0.55, maxTokens: 90 }, // steadier, price-conscious
  store_zara: { temperature: 0.72, maxTokens: 110 }, // more creative, speed-focused
  store_hugo: { temperature: 0.78, maxTokens: 120 }, // premium tone with extra room to elaborate
}

function getSellerModelTuning(sellerId: string): SellerModelTuning {
  const tuning = SELLER_MODEL_TUNING[sellerId] ?? { temperature: 0.65, maxTokens: 95 }
  const jitter = (Math.random() - 0.5) * 0.06 // ±0.03 to add subtle run-to-run variation
  return {
    temperature: Math.max(0.2, Math.min(1.2, tuning.temperature + jitter)),
    maxTokens: tuning.maxTokens,
  }
}

/**
 * Generate an offer from a seller based on their profile and negotiation context
 */
export async function generateSellerOffer(
  profile: SellerProfile,
  product: string,
  quantity: number,
  buyerMessage: string,
  roundNumber: number,
  provider: AIProvider,
  priority: Priority
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
  const priceJitter = 0.94 + Math.random() * 0.12 // +/-6% jitter for variety

  const priceSpecialization =
    priority === 'price'
      ? profile.personality.pricePoint === 'budget'
        ? 0.9
        : profile.personality.pricePoint === 'premium'
          ? 1.08
          : 1
      : 1

  const price = basePrice * variant.priceMultiplier * priceJitter * priceSpecialization

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

  // Speed priority: more chance to speed up (or refuse) based on flexibility
  if (priority === 'speed') {
    if (Math.random() < 0.5 + (profile.personality.negotiationFlexibility === 'high' ? 0.2 : 0)) {
      deliveryDays = Math.max(1, deliveryDays - 1)
    } else if (Math.random() < 0.2) {
      deliveryDays = Math.max(deliveryDays, profile.inventory.deliveryDays + 1)
    }
  }

  const carbonJitter = 0.94 + Math.random() * 0.12 // +/-6% jitter
  const carbonSpecialization =
    priority === 'carbon'
      ? profile.personality.sustainabilityFocus === 'very_high'
        ? 0.86
        : profile.personality.sustainabilityFocus === 'high'
          ? 0.9
          : profile.personality.sustainabilityFocus === 'medium'
            ? 1
            : 1.08
      : 1

  const carbon = profile.inventory.carbonFootprint * variant.carbonMultiplier * carbonJitter * carbonSpecialization

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

  const { temperature, maxTokens } = getSellerModelTuning(profile.id)

  // Use direct OpenAI for GPT models, OpenRouter for others
  const isDirectOpenAI = !model.includes('/')
  const response = isDirectOpenAI
    ? await callOpenAI(prompt, { model: model as OpenAIModel, temperature, maxTokens })
    : await callOpenRouter(prompt, {
        model,
        temperature,
        maxTokens,
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
