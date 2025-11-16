'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Send, HelpCircle, Home as HomeIcon } from 'lucide-react'
import Squares from '@/components/landing/squares'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function NegotiationPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [activeMode, setActiveMode] = useState<'search' | 'research'>('search')
  const [userName] = useState('User')

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages([...messages, newMessage])
    setInputValue('')

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'll help you find the best option. What product are you looking for?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a1a2e] text-white">
      {/* Animated Background */}
      <Squares
        direction="diagonal"
        speed={0.5}
        squareSize={40}
        borderColor="rgba(255,255,255,0.05)"
        hoverFillColor="rgba(255,255,255,0.1)"
        className="pointer-events-none absolute inset-0 z-0 opacity-60"
      />

      {/* Sidebar */}
      <aside className="relative z-10 flex w-52 flex-col border-r border-white/10 bg-[#0d1f35]/80 backdrop-blur-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold">
            PS
          </div>
          <span className="text-base font-semibold">ProductScout</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-3">
          <button className="flex w-full items-center gap-3 rounded-lg bg-blue-600/80 px-3 py-2.5 text-sm font-medium transition">
            <HomeIcon className="h-4 w-4" />
            Home
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="space-y-2 border-t border-white/10 p-4">
          <button className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-700">
            Sign up
          </button>
          <button className="w-full rounded-lg border border-white/20 bg-transparent px-4 py-2.5 text-sm font-semibold transition hover:bg-white/5">
            Log in
          </button>
          <Link
            href="/"
            className="mt-2 flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-white/60 transition hover:text-white"
          >
            <span>← Back to Home</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col">
        {messages.length === 0 ? (
          /* Empty State - Centered */
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
              <div className="relative rounded-xl bg-[#0f1f35]/60 p-4 shadow-2xl backdrop-blur-sm">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything..."
                  rows={3}
                  className="w-full resize-none bg-transparent text-sm text-white/90 placeholder-white/30 outline-none"
                />

                {/* Buttons Row */}
                <div className="mt-3 flex items-center justify-between">
                  {/* Mode Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveMode('search')}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                        activeMode === 'search'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search
                    </button>
                    <button
                      onClick={() => setActiveMode('research')}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                        activeMode === 'research'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Research
                    </button>
                  </div>

                  {/* Action Icons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className="rounded-lg bg-blue-600 p-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <>
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="mx-auto max-w-3xl space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'border border-white/10 bg-white/5 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Area - Bottom */}
            <div className="border-t border-white/10 bg-[#0d1f35]/80 px-8 py-4 backdrop-blur-sm">
              <div className="mx-auto max-w-3xl">
                <div className="relative rounded-xl bg-[#0f1f35]/60 p-3">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask anything..."
                      rows={1}
                      className="max-h-32 flex-1 resize-none bg-transparent text-sm text-white/90 placeholder-white/30 outline-none"
                    />
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className="rounded-lg bg-blue-600 p-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Help Button */}
        <Link href="/learn-more" className="absolute bottom-6 right-6 rounded-full bg-blue-600 p-3 shadow-lg transition hover:bg-blue-700">
          <HelpCircle className="h-5 w-5" />
        </Link>
      </main>
    </div>
  )
}
