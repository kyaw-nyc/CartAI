export interface Product {
  name: string
  category?: string
  quantity: number
  budget?: number
  constraints?: string[]
}

export interface ProductRequirements {
  product: string | null
  quantity: number | null
  budget: number | null
  priority: Priority | null
  additionalInfo?: Record<string, unknown>
}

export type Priority = 'speed' | 'carbon' | 'price'

export interface PriorityConfig {
  label: string
  description: string
  emoji: string
  color: string
}
