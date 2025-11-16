export type AgentRole = 'user' | 'buyer' | 'seller' | 'system'

export type AgentModel = 'gemini-2.0-flash-exp' | 'gemini-1.5-flash-8b' | 'gpt-4o' | 'gpt-4-turbo'

export interface AgentMessage {
  id: string
  role: AgentRole
  content: string
  timestamp: Date
  sellerId?: string
  sellerName?: string
  metadata?: Record<string, unknown>
}

export interface SellerProfile {
  id: string
  name: string
  model: AgentModel
  personality: {
    sustainabilityFocus: 'very_high' | 'high' | 'medium' | 'low'
    pricePoint: 'premium' | 'mid' | 'budget'
    negotiationFlexibility: 'very_high' | 'high' | 'medium' | 'low'
  }
  inventory: {
    basePrice: number
    carbonFootprint: number
    deliveryDays: number
    certifications: string[]
  }
  tactics: string[]
}

export interface BuyerAgentConfig {
  primaryGoal: 'minimize_delivery_time' | 'minimize_carbon' | 'minimize_price'
  constraints: {
    maxPrice: number
    maxCarbon?: number
    maxDays: number
  }
  negotiationStyle: 'urgent' | 'analytical' | 'aggressive'
}
