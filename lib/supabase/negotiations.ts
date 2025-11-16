'use client'

import { createSupabaseBrowserClient } from './client'
import { SavedConversation } from '@/types/negotiation'

export interface NegotiationRow {
  id: string
  user_id: string
  title: string
  product: string | null
  quantity: number | null
  budget: number | null
  selected_priority: 'speed' | 'carbon' | 'price' | null
  chat_messages: any[]
  negotiation_messages: any[]
  negotiation_result: any | null
  provider_states: any | null
  created_at: string
  updated_at: string
}

/**
 * Save a negotiation to Supabase
 */
export async function saveNegotiation(conversation: SavedConversation, userId: string): Promise<string | null> {
  const supabase = createSupabaseBrowserClient()

  const data: Partial<NegotiationRow> = {
    user_id: userId,
    title: conversation.title,
    product: conversation.product,
    quantity: conversation.quantity,
    budget: conversation.budget,
    selected_priority: conversation.selectedPriority,
    chat_messages: conversation.chatMessages,
    negotiation_messages: conversation.negotiationMessages,
    negotiation_result: conversation.negotiationResult,
    provider_states: conversation.providerStates || null,
  }

  // Check if conversation has a UUID (from database) or timestamp ID (local only)
  const isUUID = conversation.id.length === 36 && conversation.id.includes('-')

  if (isUUID) {
    // Update existing
    const { error } = await supabase.from('negotiations').update(data).eq('id', conversation.id)

    if (error) {
      console.error('Error updating negotiation:', error)
      return null
    }
    return conversation.id
  } else {
    // Insert new
    const { data: inserted, error } = await supabase
      .from('negotiations')
      .insert(data)
      .select('id')
      .single()

    if (error) {
      console.error('Error inserting negotiation:', error)
      return null
    }
    return inserted?.id || null
  }
}

/**
 * Load all negotiations for a user
 */
export async function loadNegotiations(userId: string): Promise<SavedConversation[]> {
  const supabase = createSupabaseBrowserClient()

  const { data, error } = await supabase
    .from('negotiations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading negotiations:', error)
    return []
  }

  return (data || []).map((row: NegotiationRow) => ({
    id: row.id,
    title: row.title,
    createdAt: new Date(row.created_at),
    lastUpdated: new Date(row.updated_at),
    chatMessages: row.chat_messages || [],
    product: row.product,
    quantity: row.quantity,
    budget: row.budget,
    selectedPriority: row.selected_priority,
    negotiationMessages: row.negotiation_messages || [],
    negotiationResult: row.negotiation_result,
    providerStates: row.provider_states || undefined,
  }))
}

/**
 * Delete a negotiation
 */
export async function deleteNegotiation(negotiationId: string): Promise<boolean> {
  const supabase = createSupabaseBrowserClient()

  const { error } = await supabase.from('negotiations').delete().eq('id', negotiationId)

  if (error) {
    console.error('Error deleting negotiation:', error)
    return false
  }
  return true
}
