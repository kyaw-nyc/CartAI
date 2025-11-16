import { Priority } from './product'
import { AgentMessage } from './agent'
import { AIProvider } from '@/lib/api/ai-providers'

export type { AgentMessage }

export interface ProviderNegotiationState {
  isNegotiating: boolean
  messages: AgentMessage[]
  currentBestOffer: Offer | null
  progress: number
  result: NegotiationResult | null
}

export interface Offer {
  id: string
  sellerId: string
  sellerName: string
  price: number
  carbonFootprint: number
  deliveryDays: number
  certifications: string[]
  trustScore?: number
}

export interface NegotiationRound {
  roundNumber: number
  buyerMessage: string
  sellerResponses: {
    sellerId: string
    message: string
    offer?: Offer
  }[]
  currentBest: Offer | null
}

export interface NegotiationResult {
  winner: Offer
  reasoning: string
  carbonSaved: number
  carbonSavedInMiles: number
  alternatives: Offer[]
  totalRounds: number
  duration: number
  provider?: string
}

export interface NegotiationState {
  status: 'idle' | 'negotiating' | 'completed' | 'error'
  progress: number
  currentRound: number
  totalRounds: number
  messages: AgentMessage[]
  currentBestOffer: Offer | null
  result: NegotiationResult | null
  error?: string
}

export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ConversationState {
  messages: ChatMessage[]
  extractedInfo: {
    product: string | null
    quantity: number | null
    budget: number | null
  }
  readyForPriority: boolean
  selectedPriority: Priority | null
}

export interface SavedConversation {
  id: string
  title: string
  createdAt: Date
  lastUpdated: Date
  chatMessages: ChatMessage[]
  product: string | null
  quantity: number | null
  budget: number | null
  selectedPriority: Priority | null
  negotiationMessages: AgentMessage[]
  negotiationResult: NegotiationResult | null
  providerStates?: Record<AIProvider, ProviderNegotiationState>
}
