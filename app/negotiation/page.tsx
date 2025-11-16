'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Send, HelpCircle, MessageSquare, Plus, Trash2 } from 'lucide-react'
import { SidebarFooter } from './_sidebar-footer'
import Squares from '@/components/landing/squares'
import { PrioritySelector } from '@/components/negotiation/priority-selector'
import { NegotiationView } from '@/components/negotiation/negotiation-view'
import { ResultsCard } from '@/components/negotiation/results-card'
import { ProviderTabs } from '@/components/negotiation/provider-tabs'
import { useNegotiationStore } from '@/lib/store/negotiation'
import { Priority } from '@/types/product'
import { ChatMessage } from '@/types/negotiation'
import { NegotiationUpdate } from '@/lib/agents/orchestrator'
import { formatDistanceToNow } from 'date-fns'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { AIProvider } from '@/lib/api/ai-providers'

export default function NegotiationPage() {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const initialInputRef = useRef<HTMLTextAreaElement | null>(null)
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null)

  const {
    currentConversationId,
    chatMessages,
    addChatMessage,
    product,
    quantity,
    budget,
    setRequirements,
    selectedPriority,
    setSelectedPriority,
    showPrioritySelector,
    setShowPrioritySelector,
    activeProvider,
    setActiveProvider,
    providerStates,
    addNegotiationMessage,
    updateCurrentBest,
    startNegotiation,
    setNegotiationResult,
    savedConversations,
    loadConversation,
    deleteConversation,
    startNewConversation,
    setUserId,
    loadUserNegotiations,
    reset,
  } = useNegotiationStore()

  const activeProviderState = providerStates[activeProvider]
  const negotiationMessages = activeProviderState?.messages ?? []
  const currentBestOffer = activeProviderState?.currentBestOffer ?? null
  const negotiationProgress = activeProviderState?.progress ?? 0
  const negotiationResult = activeProviderState?.result ?? null
  const isNegotiating = activeProviderState?.isNegotiating ?? false

  const [userName, setUserName] = useState('User')
  const supabase = createSupabaseBrowserClient()

  // Check auth and fetch user name on mount
  useEffect(() => {
    const checkAuthAndFetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login if not authenticated
        window.location.href = '/login'
        return
      }

      // Set user ID in store
      setUserId(user.id)

      // Load user's saved negotiations from Supabase
      await loadUserNegotiations()

      // First try to get from user metadata
      const fullName = user.user_metadata?.full_name
      if (fullName) {
        setUserName(fullName)
      } else {
        // Fallback to profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()

        if (profile?.full_name) {
          setUserName(profile.full_name)
        }
      }

      setIsCheckingAuth(false)
    }
    checkAuthAndFetchUserName()
  }, [supabase])

  useEffect(() => {
    if (showPrioritySelector || isNegotiating || negotiationResult) return
    if (chatMessages.length === 0) {
      initialInputRef.current?.focus()
    } else {
      chatInputRef.current?.focus()
    }
  }, [chatMessages.length, showPrioritySelector, isNegotiating, negotiationResult])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    addChatMessage(userMessage)
    setInputValue('')
    setIsLoading(true)

    try {
      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: chatMessages,
        }),
      })

      const data = await response.json()

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }
      addChatMessage(assistantMessage)

      // Update extracted requirements
      if (data.extractedInfo) {
        setRequirements(
          data.extractedInfo.product,
          data.extractedInfo.quantity,
          data.extractedInfo.budget
        )
      }

      // Show priority selector if ready
      if (data.readyForPriority) {
        setShowPrioritySelector(true)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm having trouble processing that. Can you try rephrasing?",
        timestamp: new Date(),
      }
      addChatMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Run negotiation for a specific provider
  const runNegotiationForProvider = async (priority: Priority, provider: AIProvider) => {
    try {
      const response = await fetch('/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: product || 'product',
          quantity: quantity || 1,
          priority,
          budget: budget || 100,
          userName: userName,
          provider,
        }),
      })

      if (!response.ok) {
        throw new Error(`Negotiation failed for ${provider}`)
      }

      // Handle Server-Sent Events
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response stream')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6)) as NegotiationUpdate

            if (data.type === 'message' && data.data.message) {
              console.log(`[${provider}] New message:`, data.data.message)
              addNegotiationMessage(data.data.message, provider)
            } else if (data.type === 'metric' && data.data.currentBest && data.data.progress !== undefined) {
              console.log(`[${provider}] Metric update:`, data.data.progress, '%')
              updateCurrentBest(data.data.currentBest, data.data.progress, provider)
            } else if (data.type === 'complete' && data.data.result) {
              console.log(`[${provider}] Negotiation complete!`, data.data.result)
              setNegotiationResult(data.data.result, provider)
            }
          }
        }
      }
    } catch (error) {
      console.error(`Negotiation error for ${provider}:`, error)
    }
  }

  const handlePrioritySelect = async (priority: Priority) => {
    const safeProduct = product || 'product'
    const safeQuantity = quantity || 1
    const safeBudget = budget || 100
    // Ensure requirements are populated so negotiation API has values
    setRequirements(safeProduct, safeQuantity, safeBudget)

    setSelectedPriority(priority)

    // Start all three negotiations in parallel
    const providers: AIProvider[] = ['openrouter', 'anthropic', 'gemini']
    providers.forEach((provider) => startNegotiation(provider))

    // Run all negotiations in parallel
    await Promise.all(providers.map((provider) => runNegotiationForProvider(priority, provider)))
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white mx-auto"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black text-white">
      {/* Animated Background */}
      <Squares
        direction="diagonal"
        speed={0.45}
        squareSize={46}
        borderColor="rgba(255,255,255,0.14)"
        hoverFillColor="rgba(255,255,255,0.06)"
        className="pointer-events-none fixed inset-0 z-0 opacity-90"
      />

      {/* Sidebar */}
      <aside className="relative z-10 flex h-full w-64 min-w-[16rem] max-w-[16rem] shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-black/80 backdrop-blur-sm">
        {/* Logo */}
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-black">
              CA
            </div>
            <span className="text-base font-semibold">CartAI</span>
          </div>

        {/* New Chat Button */}
        <div className="border-b border-white/10 p-3">
          <button
            onClick={startNewConversation}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/30 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        {/* Conversation History */}
        <div className="flex-1 overflow-y-auto p-3">
          <h3 className="mb-2 px-2 text-xs font-semibold text-white/40">RECENT CHATS</h3>
          <div className="space-y-1">
            {savedConversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative flex flex-col rounded-lg px-3 py-2 transition ${
                  currentConversationId === conv.id
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <button
                  onClick={() => loadConversation(conv.id)}
                  className="flex items-start gap-2 text-left"
                >
                  <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{conv.title}</p>
                    <p className="text-xs text-white/40">
                      {formatDistanceToNow(new Date(conv.lastUpdated), { addSuffix: true })}
                    </p>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Delete this conversation?')) {
                      deleteConversation(conv.id)
                    }
                  }}
                  className="absolute right-2 top-2 rounded p-1 opacity-0 transition hover:bg-red-600/20 group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3 text-red-400" />
                </button>
              </div>
            ))}
            {savedConversations.length === 0 && (
              <p className="px-2 py-4 text-center text-xs text-white/30">No saved conversations yet</p>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <SidebarFooter />
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex h-full flex-1 flex-col overflow-hidden">
        {/* Provider Tabs - Show when any provider is negotiating or has results */}
        {Object.values(providerStates).some((state) => state.isNegotiating || state.result) && (
          <>
            <ProviderTabs activeProvider={activeProvider} onProviderChange={setActiveProvider} />
            {/* Debug Info */}
            <div className="border-b border-white/10 bg-black/40 px-6 py-2 text-xs text-white/40">
              {Object.entries(providerStates).map(([key, state]) => (
                <span key={key} className="mr-4">
                  {key}: {state.isNegotiating ? '🔄' : state.result ? '✅' : '⏸️'}
                  {state.messages.length} msgs, {state.progress}%
                </span>
              ))}
            </div>
          </>
        )}

        {negotiationResult ? (
          /* Results View */
          <div className="flex flex-1 overflow-y-auto p-8">
            <div className="m-auto w-full">
              <ResultsCard
                result={negotiationResult}
                negotiationMessages={negotiationMessages}
                onComplete={() => {
                  // In real app, redirect to checkout
                  alert('Redirecting to checkout...')
                }}
                onShowAlternatives={() => {
                  alert(`Alternatives: ${negotiationResult.alternatives.map((a) => a.sellerName).join(', ')}`)
                }}
              />
            </div>
          </div>
        ) : isNegotiating ? (
          /* Negotiation in Progress */
          <div className="flex flex-1 flex-col p-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">
                Negotiating for {product}
                {selectedPriority && (
                  <span className="ml-2 text-sm text-white/60">
                    (Priority: {selectedPriority === 'speed' ? '⚡ Speed' : selectedPriority === 'carbon' ? '🌱 Carbon' : '💰 Price'})
                  </span>
                )}
              </h2>
            </div>
            <NegotiationView
              messages={negotiationMessages}
              currentBest={currentBestOffer}
              progress={negotiationProgress}
            />
          </div>
        ) : showPrioritySelector ? (
          /* Priority Selection */
          <div className="flex flex-1 items-center justify-center">
            <PrioritySelector onSelect={handlePrioritySelect} />
          </div>
        ) : chatMessages.length === 0 ? (
          /* Empty State - Greeting */
          <div className="flex flex-1 flex-col items-center justify-center px-8">
            <div className="w-full max-w-2xl">
              {/* Greeting */}
              <div className="mb-8 text-center">
                <h1 className="text-4xl font-normal text-white">
                  {getGreeting()} {userName}
                </h1>
                <p className="mt-2 text-xl text-white/50">How Can I help you Today?</p>
              </div>

              {/* Input Box */}
              <div className="relative rounded-xl border border-white/20 bg-white/5 p-4 shadow-2xl backdrop-blur-sm">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tell me what you need..."
                  rows={3}
                  disabled={isLoading}
                  ref={initialInputRef}
                  className="w-full resize-none bg-transparent text-sm text-white/90 placeholder-white/40 outline-none disabled:opacity-50"
                />

                {/* Send Button */}
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="rounded-lg border border-white/30 bg-white p-2 text-black transition hover:bg-white/90 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Chat View */
          <div className="flex flex-1 flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="mx-auto max-w-3xl space-y-6">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.type === 'user'
                          ? 'border border-white/30 bg-white text-black'
                          : 'border border-white/20 bg-white/5 text-white backdrop-blur-sm'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-white/60"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-white/60" style={{ animationDelay: '0.2s' }}></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-white/60" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area - Bottom */}
            <div className="border-t border-white/10 bg-black/80 px-8 py-4 backdrop-blur-sm">
              <div className="mx-auto max-w-3xl">
                <div className="relative rounded-xl border border-white/20 bg-white/5 p-3">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask anything..."
                      rows={1}
                      disabled={isLoading}
                      ref={chatInputRef}
                      className="max-h-32 flex-1 resize-none bg-transparent text-sm text-white/90 placeholder-white/40 outline-none disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className="rounded-lg border border-white/30 bg-white p-2 text-black transition hover:bg-white/90 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Button */}
        <Link href="/learn-more" className="absolute bottom-6 right-6 rounded-full border border-white/30 bg-white p-3 shadow-lg transition hover:bg-white/90">
          <HelpCircle className="h-5 w-5 text-black" />
        </Link>
      </main>
    </div>
  )
}
