'use client'

import { useEffect, useRef } from 'react'
import { AgentMessage, Offer } from '@/types/negotiation'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatCarbon, formatDelivery } from '@/lib/utils/formatters'
import { motion, AnimatePresence } from 'framer-motion'

interface NegotiationViewProps {
  messages: AgentMessage[]
  currentBest: Offer | null
  progress: number
}

export function NegotiationView({ messages, currentBest, progress }: NegotiationViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex h-full max-h-[600px] gap-4">
      {/* Left: Agent Messages */}
      <Card className="flex flex-1 flex-col border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-semibold text-white">Negotiation Chat</h3>
          <Badge variant="secondary" className="border border-white/30 bg-white text-black">
            Live
          </Badge>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto pr-2">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: message.role === 'buyer' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'buyer' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.role === 'buyer'
                      ? 'border border-white/30 bg-white text-black'
                      : 'border border-white/20 bg-white/10 text-white/90 backdrop-blur-sm'
                  }`}
                >
                  {message.role === 'seller' && message.sellerName && (
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold opacity-70">{message.sellerName}</span>
                      {message.model && (
                        <span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-medium opacity-60">
                          {message.model}
                        </span>
                      )}
                    </div>
                  )}
                  {message.role === 'buyer' && (
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold opacity-70">Your Agent</span>
                      {message.model && (
                        <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-medium opacity-60">
                          {message.model}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </Card>

      {/* Right: Metrics Panel */}
      <Card className="flex w-80 flex-col border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
        <div className="mb-3 border-b border-white/10 pb-3">
          <h3 className="text-sm font-semibold text-white">Live Metrics</h3>
        </div>

        <div className="flex-1 space-y-4">
          {/* Progress */}
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-white/60">
              <span>Negotiation Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Best Offer */}
          {currentBest && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 rounded-lg border border-white/20 bg-white/5 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
                  Current Best
                </span>
                <Badge className="border border-white/30 bg-white text-black">{currentBest.sellerName}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Price</span>
                  <span className="text-lg font-semibold text-white">
                    {formatPrice(currentBest.price)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Carbon</span>
                  <span className="text-sm font-medium text-green-400">
                    {formatCarbon(currentBest.carbonFootprint)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Delivery</span>
                  <span className="text-sm font-medium text-white">
                    {formatDelivery(currentBest.deliveryDays)}
                  </span>
                </div>

                {currentBest.certifications.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs text-white/60">Certifications:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {currentBest.certifications.map((cert) => (
                        <Badge
                          key={cert}
                          variant="secondary"
                          className="bg-white/10 text-xs text-white"
                        >
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Status */}
          <div className="rounded-lg bg-white/5 p-3 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
              <span className="text-xs text-white/70">Agents negotiating...</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
