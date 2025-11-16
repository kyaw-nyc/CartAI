/**
 * AI Provider configurations for multi-model negotiations
 * Each provider uses different models for buyer and seller agents
 *
 * NOTE: This file is safe to import in browser code - it only contains
 * configuration data, not API clients
 */

export type AIProvider = 'openrouter' | 'anthropic' | 'gemini'

// Model type references (avoiding direct import of openrouter client)
export type OpenRouterModel = string

export interface ProviderConfig {
  id: AIProvider
  name: string
  description: string
  buyerModel: OpenRouterModel
  sellerModels: {
    premium: OpenRouterModel
    standard: OpenRouterModel
    budget: OpenRouterModel
  }
  color: string // For UI tab styling
}

/**
 * OpenAI Direct Configuration
 * Buyer: Your OpenAI API (GPT-4o-mini)
 * Sellers: Your OpenAI GPT-4o + OpenRouter Gemini + OpenRouter Claude
 */
export const OPENROUTER_CONFIG: ProviderConfig = {
  id: 'openrouter',
  name: 'OpenAI GPT',
  description: 'GPT-4o-mini buyer with mixed sellers',
  buyerModel: 'gpt-4o-mini',
  sellerModels: {
    premium: 'gpt-4o',                      // Seller 1: Your OpenAI API
    standard: 'openrouter/sherlock-think-alpha', // Seller 2: Sherlock reasoning
    budget: 'anthropic/claude-3.5-sonnet',  // Seller 3: OpenRouter Claude
  },
  color: 'blue',
}

/**
 * Anthropic Claude Configuration
 * Buyer: OpenRouter Claude Haiku
 * Sellers: Your OpenAI GPT-4o + OpenRouter Gemini + OpenRouter Claude
 */
export const ANTHROPIC_CONFIG: ProviderConfig = {
  id: 'anthropic',
  name: 'Anthropic Claude',
  description: 'Claude Haiku buyer with Sherlock + GPT sellers',
  buyerModel: 'anthropic/claude-3-haiku', // OpenRouter
  sellerModels: {
    premium: 'gpt-4o',                      // Seller 1: Your OpenAI API
    standard: 'openrouter/sherlock-think-alpha', // Seller 2: Sherlock reasoning
    budget: 'anthropic/claude-3.5-sonnet',  // Seller 3: OpenRouter Claude
  },
  color: 'purple',
}

/**
 * Google Gemini Configuration
 * Buyer: OpenRouter Gemini Flash
 * Sellers: Your OpenAI GPT-4o + OpenRouter Gemini + OpenRouter Claude
 */
export const GEMINI_CONFIG: ProviderConfig = {
  id: 'gemini',
  name: 'Sherlock',
  description: 'Sherlock reasoner buyer with mixed sellers',
  buyerModel: 'openrouter/sherlock-think-alpha', // OpenRouter
  sellerModels: {
    premium: 'gpt-4o',                      // Seller 1: Your OpenAI API
    standard: 'openrouter/sherlock-think-alpha', // Seller 2: OpenRouter Sherlock
    budget: 'anthropic/claude-3.5-sonnet',  // Seller 3: OpenRouter Claude
  },
  color: 'green',
}

/**
 * All available provider configurations
 */
export const AI_PROVIDERS: Record<AIProvider, ProviderConfig> = {
  openrouter: OPENROUTER_CONFIG,
  anthropic: ANTHROPIC_CONFIG,
  gemini: GEMINI_CONFIG,
}

/**
 * Get provider configuration by ID
 */
export function getProviderConfig(provider: AIProvider): ProviderConfig {
  return AI_PROVIDERS[provider]
}

/**
 * Get all provider configurations as array
 */
export function getAllProviders(): ProviderConfig[] {
  return Object.values(AI_PROVIDERS)
}
