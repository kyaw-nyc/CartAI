import { callOpenRouter, OPENROUTER_MODELS } from '../api/openrouter'
import { BuyerAgentConfig } from '@/types/agent'
import { Priority } from '@/types/product'
import { Offer } from '@/types/negotiation'

/**
 * Get buyer agent configuration based on user's chosen priority
 */
export function getBuyerConfig(priority: Priority, budget: number): BuyerAgentConfig {
  const configs: Record<Priority, BuyerAgentConfig> = {
    speed: {
      primaryGoal: 'minimize_delivery_time',
      constraints: {
        maxPrice: budget * 1.3, // Allow 30% over budget for speed
        maxDays: 2, // Hard limit: 2 days
      },
      negotiationStyle: 'urgent',
    },
    carbon: {
      primaryGoal: 'minimize_carbon',
      constraints: {
        maxPrice: budget * 1.1, // Allow 10% over budget
        maxCarbon: 15, // Target low carbon
        maxDays: 14, // Flexible on time
      },
      negotiationStyle: 'analytical',
    },
    price: {
      primaryGoal: 'minimize_price',
      constraints: {
        maxPrice: budget,
        maxDays: 7,
      },
      negotiationStyle: 'aggressive',
    },
  }

  return configs[priority]
}

/**
 * Generate buyer agent's initial request message
 */
export async function generateBuyerRequest(
  product: string,
  quantity: number,
  priority: Priority,
  config: BuyerAgentConfig,
  userName: string = 'Customer'
): Promise<string> {
  const priorityDescriptions = {
    speed: 'fastest possible delivery',
    carbon: 'lowest environmental impact with verified sustainability',
    price: 'best price while maintaining quality',
  }

  const prompt = `You are a professional buyer agent representing ${userName}.

Product needed: ${quantity} ${product}
Primary priority: ${priorityDescriptions[priority]}
Budget: $${config.constraints.maxPrice}
${config.constraints.maxCarbon ? `Target carbon: Under ${config.constraints.maxCarbon}kg CO₂` : ''}
Max delivery time: ${config.constraints.maxDays} days

Write a clear, professional opening request to sellers (2-3 sentences).
Start with "Dear Seller," and sign off with "Best regards, ${userName}".
Emphasize your priority (${priority}) and be specific about requirements.
Keep it under 60 words total.`

  // Buyer uses GPT-4o Mini (cheap but strategic)
  const response = await callOpenRouter(prompt, {
    model: OPENROUTER_MODELS.GPT4O_MINI,
    temperature: 0.8,
  })

  if (!response.success || !response.content) {
    // Fallback based on priority
    if (priority === 'speed') {
      return `Dear Seller, I am seeking ${quantity} ${product} with fastest possible delivery (ideally 1-2 days). Budget is flexible for speed. Please confirm availability and delivery within 7 days. Best regards, ${userName}`
    } else if (priority === 'carbon') {
      return `Dear Seller, Seeking ${quantity} ${product} with lowest carbon footprint. Must have verified sustainability certifications. Willing to wait for eco-friendly options. Best regards, ${userName}`
    } else {
      return `Dear Seller, I need ${quantity} ${product} at best possible price. Must deliver within ${config.constraints.maxDays} days. Best regards, ${userName}`
    }
  }

  return response.content
}

/**
 * Generate buyer agent's counter-offer or response to seller offers
 */
export async function generateBuyerResponse(
  product: string,
  quantity: number,
  priority: Priority,
  config: BuyerAgentConfig,
  offers: Offer[],
  roundNumber: number,
  userName: string = 'Customer'
): Promise<string> {
  const bestOffer = getBestOffer(offers, priority)

  const offersText = offers
    .map(
      (o) =>
        `${o.sellerName}: $${o.price}, ${o.carbonFootprint}kg CO₂, ${o.deliveryDays} days, [${o.certifications.join(', ') || 'No certs'}]`
    )
    .join('\n')

  const prompt = `You are a strategic buyer agent representing ${userName}. Round ${roundNumber}/6 of negotiation.

Your priority: ${priority}
Your constraints: ${JSON.stringify(config.constraints)}
Product: ${quantity} ${product}

Current offers:
${offersText}

Current best offer (by your priority): ${bestOffer.sellerName}

Task: Respond strategically to push for better terms on your PRIMARY goal (${priority}).
- If optimizing for ${priority === 'speed' ? 'SPEED' : priority === 'carbon' ? 'CARBON' : 'PRICE'}, focus on improving that metric
- Reference specific sellers and their offers
- Be persuasive but professional
- Keep under 50 words

Your response:`

  // Buyer uses GPT-4o Mini (cheap but strategic)
  const response = await callOpenRouter(prompt, {
    model: OPENROUTER_MODELS.GPT4O_MINI,
    temperature: 0.85,
  })

  if (!response.success || !response.content) {
    // Intelligent fallback based on priority
    if (priority === 'speed' && bestOffer.deliveryDays > 1) {
      return `@${bestOffer.sellerName} - Can you deliver faster than ${bestOffer.deliveryDays} days? We need this urgently.`
    } else if (priority === 'carbon') {
      return `@${bestOffer.sellerName} - Your carbon footprint looks good. Can you provide detailed breakdown and certifications?`
    } else {
      return `@${bestOffer.sellerName} - Competitive price, but can you go lower? We're comparing multiple suppliers.`
    }
  }

  return response.content
}

/**
 * Get the best offer based on priority
 */
function getBestOffer(offers: Offer[], priority: Priority): Offer {
  if (offers.length === 0) {
    throw new Error('No offers to evaluate')
  }

  if (priority === 'speed') {
    return offers.reduce((best, current) => (current.deliveryDays < best.deliveryDays ? current : best))
  } else if (priority === 'carbon') {
    return offers.reduce((best, current) => (current.carbonFootprint < best.carbonFootprint ? current : best))
  } else {
    // price
    return offers.reduce((best, current) => (current.price < best.price ? current : best))
  }
}
