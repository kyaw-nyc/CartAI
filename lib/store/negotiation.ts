import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ChatMessage, NegotiationResult, AgentMessage, SavedConversation } from '@/types/negotiation'
import { Priority } from '@/types/product'
import { Offer } from '@/types/negotiation'
import { saveNegotiation, loadNegotiations, deleteNegotiation as deleteNegotiationDb } from '@/lib/supabase/negotiations'

interface NegotiationStore {
  // Current conversation ID
  currentConversationId: string | null

  // User ID for Supabase
  userId: string | null
  setUserId: (userId: string | null) => void

  // Chat state
  chatMessages: ChatMessage[]
  addChatMessage: (message: ChatMessage) => void

  // Extracted user requirements
  product: string | null
  quantity: number | null
  budget: number | null
  setRequirements: (product: string | null, quantity: number | null, budget: number | null) => void

  // Priority selection
  selectedPriority: Priority | null
  setSelectedPriority: (priority: Priority) => void
  showPrioritySelector: boolean
  setShowPrioritySelector: (show: boolean) => void

  // Negotiation state
  isNegotiating: boolean
  negotiationMessages: AgentMessage[]
  currentBestOffer: Offer | null
  negotiationProgress: number
  addNegotiationMessage: (message: AgentMessage) => void
  updateCurrentBest: (offer: Offer, progress: number) => void
  startNegotiation: () => void

  // Results
  negotiationResult: NegotiationResult | null
  setNegotiationResult: (result: NegotiationResult) => void

  // Conversation history
  savedConversations: SavedConversation[]
  saveCurrentConversation: () => Promise<void>
  loadConversation: (id: string) => void
  deleteConversation: (id: string) => Promise<void>
  startNewConversation: () => void
  loadUserNegotiations: () => Promise<void>

  // Actions
  reset: () => void
}

export const useNegotiationStore = create<NegotiationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentConversationId: null,
      userId: null,
      chatMessages: [],
      product: null,
      quantity: null,
      budget: null,
      selectedPriority: null,
      showPrioritySelector: false,
      isNegotiating: false,
      negotiationMessages: [],
      currentBestOffer: null,
      negotiationProgress: 0,
      negotiationResult: null,
      savedConversations: [],

      // Set user ID
      setUserId: (userId) => set({ userId }),

      // Chat actions
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),

      // Requirements
      setRequirements: (product, quantity, budget) =>
        set({
          product,
          quantity,
          budget,
        }),

      // Priority
      setSelectedPriority: (priority) =>
        set({
          selectedPriority: priority,
          showPrioritySelector: false,
        }),

      setShowPrioritySelector: (show) =>
        set({
          showPrioritySelector: show,
        }),

      // Negotiation
      startNegotiation: () =>
        set({
          isNegotiating: true,
          negotiationMessages: [],
          currentBestOffer: null,
          negotiationProgress: 0,
          negotiationResult: null,
        }),

      addNegotiationMessage: (message) =>
        set((state) => ({
          negotiationMessages: [...state.negotiationMessages, message],
        })),

      updateCurrentBest: (offer, progress) =>
        set({
          currentBestOffer: offer,
          negotiationProgress: progress,
        }),

      setNegotiationResult: (result) =>
        set((state) => {
          // Auto-save when negotiation completes
          const newState = {
            negotiationResult: result,
            isNegotiating: false,
            negotiationProgress: 100,
          }

          // Save conversation after setting result
          setTimeout(() => {
            get().saveCurrentConversation()
          }, 0)

          return newState
        }),

      // Conversation history
      saveCurrentConversation: async () => {
        const state = get()
        const {
          currentConversationId,
          userId,
          chatMessages,
          product,
          quantity,
          budget,
          selectedPriority,
          negotiationMessages,
          negotiationResult,
          savedConversations,
        } = state

        // Generate title from product or first message
        const title = product || chatMessages[0]?.content.slice(0, 30) || 'New Conversation'
        const now = new Date()

        let conversation: SavedConversation

        if (currentConversationId) {
          // Update existing conversation
          conversation = {
            id: currentConversationId,
            title,
            createdAt:
              savedConversations.find((c) => c.id === currentConversationId)?.createdAt || now,
            lastUpdated: now,
            chatMessages,
            product,
            quantity,
            budget,
            selectedPriority,
            negotiationMessages,
            negotiationResult,
          }

          set({
            savedConversations: savedConversations.map((conv) =>
              conv.id === currentConversationId ? conversation : conv
            ),
          })
        } else {
          // Create new conversation
          conversation = {
            id: Date.now().toString(),
            title,
            createdAt: now,
            lastUpdated: now,
            chatMessages,
            product,
            quantity,
            budget,
            selectedPriority,
            negotiationMessages,
            negotiationResult,
          }

          set({
            currentConversationId: conversation.id,
            savedConversations: [conversation, ...savedConversations],
          })
        }

        // Save to Supabase if user is logged in
        if (userId) {
          const savedId = await saveNegotiation(conversation, userId)
          if (savedId && savedId !== conversation.id) {
            // Update local state with database ID
            set((state) => ({
              currentConversationId: savedId,
              savedConversations: state.savedConversations.map((conv) =>
                conv.id === conversation.id ? { ...conv, id: savedId } : conv
              ),
            }))
          }
        }
      },

      loadConversation: (id) =>
        set((state) => {
          const conversation = state.savedConversations.find((conv) => conv.id === id)
          if (!conversation) return state

          return {
            currentConversationId: id,
            chatMessages: conversation.chatMessages,
            product: conversation.product,
            quantity: conversation.quantity,
            budget: conversation.budget,
            selectedPriority: conversation.selectedPriority,
            showPrioritySelector: false,
            isNegotiating: false,
            negotiationMessages: conversation.negotiationMessages,
            currentBestOffer: null,
            negotiationProgress: conversation.negotiationResult ? 100 : 0,
            negotiationResult: conversation.negotiationResult,
          }
        }),

      deleteConversation: async (id) => {
        // Delete from Supabase if it's a UUID (database ID)
        const isUUID = id.length === 36 && id.includes('-')
        if (isUUID) {
          await deleteNegotiationDb(id)
        }

        // Delete from local state
        set((state) => ({
          savedConversations: state.savedConversations.filter((conv) => conv.id !== id),
          ...(state.currentConversationId === id
            ? {
                currentConversationId: null,
                chatMessages: [],
                product: null,
                quantity: null,
                budget: null,
                selectedPriority: null,
                showPrioritySelector: false,
                isNegotiating: false,
                negotiationMessages: [],
                currentBestOffer: null,
                negotiationProgress: 0,
                negotiationResult: null,
              }
            : {}),
        }))
      },

      loadUserNegotiations: async () => {
        const { userId } = get()
        if (!userId) return

        const negotiations = await loadNegotiations(userId)
        set({ savedConversations: negotiations })
      },

      startNewConversation: () =>
        set({
          currentConversationId: null,
          chatMessages: [],
          product: null,
          quantity: null,
          budget: null,
          selectedPriority: null,
          showPrioritySelector: false,
          isNegotiating: false,
          negotiationMessages: [],
          currentBestOffer: null,
          negotiationProgress: 0,
          negotiationResult: null,
        }),

      // Reset (same as start new conversation)
      reset: () => get().startNewConversation(),
    }),
    {
      name: 'negotiation-storage',
      partialize: (state) => ({
        savedConversations: state.savedConversations,
      }),
    }
  )
)
