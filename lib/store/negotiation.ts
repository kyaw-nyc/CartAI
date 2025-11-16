import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ChatMessage, NegotiationResult, AgentMessage, SavedConversation } from '@/types/negotiation'
import { Priority } from '@/types/product'
import { Offer } from '@/types/negotiation'

interface NegotiationStore {
  // Current conversation ID
  currentConversationId: string | null

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
  saveCurrentConversation: () => void
  loadConversation: (id: string) => void
  deleteConversation: (id: string) => void
  startNewConversation: () => void

  // Actions
  reset: () => void
}

export const useNegotiationStore = create<NegotiationStore>()(
  persist(
    (set, get) => ({
      // Initial state
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
      savedConversations: [],

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
      saveCurrentConversation: () =>
        set((state) => {
          const {
            currentConversationId,
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

          if (currentConversationId) {
            // Update existing conversation
            return {
              savedConversations: savedConversations.map((conv) =>
                conv.id === currentConversationId
                  ? {
                      ...conv,
                      title,
                      lastUpdated: now,
                      chatMessages,
                      product,
                      quantity,
                      budget,
                      selectedPriority,
                      negotiationMessages,
                      negotiationResult,
                    }
                  : conv
              ),
            }
          } else {
            // Create new conversation
            const newConversation: SavedConversation = {
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

            return {
              currentConversationId: newConversation.id,
              savedConversations: [newConversation, ...savedConversations],
            }
          }
        }),

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

      deleteConversation: (id) =>
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
        })),

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
