import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ChatMessage, NegotiationResult, AgentMessage, SavedConversation, ProviderNegotiationState } from '@/types/negotiation'
import { Priority } from '@/types/product'
import { Offer } from '@/types/negotiation'
import { saveNegotiation, loadNegotiations, deleteNegotiation as deleteNegotiationDb } from '@/lib/supabase/negotiations'
import { AIProvider } from '@/lib/api/ai-providers'

export const createInitialProviderStates = (): Record<AIProvider, ProviderNegotiationState> => ({
  openrouter: {
    isNegotiating: false,
    messages: [],
    currentBestOffer: null,
    progress: 0,
    result: null,
  },
  anthropic: {
    isNegotiating: false,
    messages: [],
    currentBestOffer: null,
    progress: 0,
    result: null,
  },
  gemini: {
    isNegotiating: false,
    messages: [],
    currentBestOffer: null,
    progress: 0,
    result: null,
  },
})

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

  // Single-store negotiation
  selectedStoreId: string | null
  setSelectedStoreId: (storeId: string | null) => void

  // Active provider
  activeProvider: AIProvider
  setActiveProvider: (provider: AIProvider) => void

  // Provider-specific negotiation states
  providerStates: Record<AIProvider, ProviderNegotiationState>

  // Negotiation actions (work with active provider)
  addNegotiationMessage: (message: AgentMessage, provider?: AIProvider) => void
  updateCurrentBest: (offer: Offer, progress: number, provider?: AIProvider) => void
  startNegotiation: (provider?: AIProvider) => void
  setNegotiationResult: (result: NegotiationResult, provider?: AIProvider) => void

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
      selectedStoreId: null,
      activeProvider: 'openrouter' as AIProvider,
      providerStates: createInitialProviderStates(),
      savedConversations: [],

      // Set user ID
      setUserId: (userId) => set({ userId }),

      // Set selected store
      setSelectedStoreId: (storeId) => set({ selectedStoreId: storeId }),

      // Set active provider
      setActiveProvider: (provider) => set({ activeProvider: provider }),

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
      startNegotiation: (provider) => {
        const targetProvider = provider || get().activeProvider
        set((state) => ({
          providerStates: {
            ...state.providerStates,
            [targetProvider]: {
              isNegotiating: true,
              messages: [],
              currentBestOffer: null,
              progress: 0,
              result: null,
            },
          },
        }))
      },

      addNegotiationMessage: (message, provider) => {
        const targetProvider = provider || get().activeProvider
        set((state) => ({
          providerStates: {
            ...state.providerStates,
            [targetProvider]: {
              ...state.providerStates[targetProvider],
              messages: [...state.providerStates[targetProvider].messages, message],
            },
          },
        }))
      },

      updateCurrentBest: (offer, progress, provider) => {
        const targetProvider = provider || get().activeProvider
        set((state) => ({
          providerStates: {
            ...state.providerStates,
            [targetProvider]: {
              ...state.providerStates[targetProvider],
              currentBestOffer: offer,
              progress,
            },
          },
        }))
      },

      setNegotiationResult: (result, provider) => {
        const targetProvider = provider || get().activeProvider
        set((state) => ({
          providerStates: {
            ...state.providerStates,
            [targetProvider]: {
              ...state.providerStates[targetProvider],
              result,
              isNegotiating: false,
              progress: 100,
            },
          },
        }))

        // Save conversation after all providers complete
        const allComplete = Object.values(get().providerStates).every(
          (state) => !state.isNegotiating
        )
        if (allComplete) {
          setTimeout(() => {
            get().saveCurrentConversation()
          }, 0)
        }
      },

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
          providerStates,
          savedConversations,
        } = state
        // Keep backward compatibility: store the active provider's messages/result at conversation level
        const activeNegotiationState = providerStates[state.activeProvider]
        const negotiationMessages = activeNegotiationState.messages
        const negotiationResult = activeNegotiationState.result

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
            providerStates,
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
            providerStates,
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

          const providerStates =
            conversation.providerStates ||
            (() => {
              const defaults = createInitialProviderStates()
              defaults.openrouter = {
                isNegotiating: false,
                messages: conversation.negotiationMessages,
                currentBestOffer: conversation.negotiationResult?.winner || null,
                progress: conversation.negotiationResult ? 100 : 0,
                result: conversation.negotiationResult,
              }
              return defaults
            })()

          return {
            currentConversationId: id,
            chatMessages: conversation.chatMessages,
            product: conversation.product,
            quantity: conversation.quantity,
            budget: conversation.budget,
            selectedPriority: conversation.selectedPriority,
            showPrioritySelector: false,
            activeProvider: 'openrouter' as AIProvider,
            providerStates,
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
                activeProvider: 'openrouter' as AIProvider,
                providerStates: createInitialProviderStates(),
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
          activeProvider: 'openrouter' as AIProvider,
          providerStates: createInitialProviderStates(),
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
