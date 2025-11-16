'use client'

import { useState } from 'react'
import { NegotiationResult } from '@/types/negotiation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatCarbon, formatDelivery } from '@/lib/utils/formatters'
import { getCarbonComparison } from '@/lib/utils/carbon'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, TrendingDown, Truck, Award, MessageSquare, ChevronDown, ChevronUp, Leaf, RefreshCw } from 'lucide-react'

interface ResultsCardProps {
  result: NegotiationResult
  negotiationMessages: import('@/types/negotiation').AgentMessage[]
  onComplete: () => void
  onShowAlternatives: () => void
  onRenegotiate?: () => void
}

export function ResultsCard({ result, negotiationMessages, onComplete, onShowAlternatives, onRenegotiate }: ResultsCardProps) {
  const { winner, reasoning, carbonSaved, carbonSavedInMiles, alternatives } = result
  const [showNegotiationHistory, setShowNegotiationHistory] = useState(false)
  const [showAlternatives, setShowAlternatives] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-3xl"
    >
      <Card className="border border-white/20 bg-white/5 p-8 backdrop-blur-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-4 flex justify-center"
          >
            <div className="rounded-full bg-white p-3">
              <CheckCircle2 className="h-8 w-8 text-black" />
            </div>
          </motion.div>
          <h2 className="text-3xl font-semibold text-white">Perfect! Found the best option</h2>
          <p className="mt-2 text-base text-white/60">Here&apos;s what we negotiated for you</p>
        </div>

        {/* Winner Card */}
        <div className="mb-6 rounded-lg border border-white/30 bg-white/10 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-white">{winner.sellerName}</h3>
            <Badge className="border border-white/30 bg-white text-sm font-medium text-black">Winner</Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col space-y-1 rounded-lg border border-white/20 bg-white/5 p-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-white/60" />
                <p className="text-xs font-medium text-white/60">Price</p>
              </div>
              <p className="text-2xl font-semibold text-white">{formatPrice(winner.price)}</p>
            </div>

            <div className="flex flex-col space-y-1 rounded-lg border border-white/20 bg-white/5 p-4">
              <div className="flex items-center space-x-2">
                <Leaf className="h-4 w-4 text-white/60" />
                <p className="text-xs font-medium text-white/60">Carbon</p>
              </div>
              <p className="text-2xl font-semibold text-white">{formatCarbon(winner.carbonFootprint)}</p>
            </div>

            <div className="flex flex-col space-y-1 rounded-lg border border-white/20 bg-white/5 p-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-white/60" />
                <p className="text-xs font-medium text-white/60">Delivery</p>
              </div>
              <p className="text-2xl font-semibold text-white">{formatDelivery(winner.deliveryDays)}</p>
            </div>
          </div>

          {/* Certifications */}
          {winner.certifications.length > 0 && (
            <div className="mt-4 flex items-center space-x-2">
              <Award className="h-4 w-4 text-white/60" />
              <span className="text-sm text-white/60">Verified:</span>
              <div className="flex flex-wrap gap-1.5">
                {winner.certifications.map((cert) => (
                  <Badge key={cert} className="border border-white/30 bg-white/10 text-xs text-white">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Environmental Impact */}
        {carbonSaved > 0 && (
          <div className="mb-6 rounded-lg border border-white/20 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <div className="rounded-lg bg-white/10 p-2">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">Environmental Impact</h4>
                <p className="mt-1 text-sm text-white/70">
                  You&apos;re saving <span className="font-semibold text-white">{formatCarbon(carbonSaved)}</span> vs
                  average!
                </p>
                <p className="mt-1 text-sm text-white/60">{getCarbonComparison(carbonSaved)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reasoning */}
        <div className="mb-6 rounded-lg border border-white/20 bg-white/5 p-5 backdrop-blur-sm">
          <h4 className="mb-2 text-sm font-semibold text-white">Why this won</h4>
          <p className="text-sm leading-relaxed text-white/70">{reasoning}</p>
        </div>

        {/* Alternatives Section */}
        <AnimatePresence>
          {showAlternatives && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 space-y-3 overflow-hidden"
            >
              <h4 className="text-sm font-semibold text-white">Alternative Options</h4>
              {alternatives.map((alt, index) => (
                <div
                  key={alt.id}
                  className="rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-semibold text-white">{alt.sellerName}</span>
                    <Badge className="border border-white/30 bg-white/10 text-xs text-white">
                      Option {index + 2}
                    </Badge>
                  </div>
                  <div className="grid gap-3 text-sm sm:grid-cols-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-white/60">Price</span>
                      <span className="font-semibold text-white">{formatPrice(alt.price)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-white/60">Carbon</span>
                      <span className="font-semibold text-white">{formatCarbon(alt.carbonFootprint)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-white/60">Delivery</span>
                      <span className="font-semibold text-white">{formatDelivery(alt.deliveryDays)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Negotiation History Section */}
        <AnimatePresence>
          {showNegotiationHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 max-h-96 space-y-3 overflow-hidden"
            >
              <h4 className="text-sm font-semibold text-white">Negotiation History</h4>
              <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
                {negotiationMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg border p-3 backdrop-blur-sm ${
                      msg.role === 'buyer'
                        ? 'border-white/30 bg-white/10 text-white'
                        : 'border-white/20 bg-white/5 text-white/90'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white/70">
                        {msg.role === 'buyer' ? 'Your Agent' : msg.sellerName}
                      </span>
                      {msg.model && (
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          msg.role === 'buyer'
                            ? 'bg-white/20 text-white/60'
                            : 'bg-black/20 text-white/60'
                        }`}>
                          {msg.model}
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onComplete}
              className="flex-1 rounded-lg border border-white/30 bg-white px-6 py-3 font-semibold text-black transition hover:bg-white/90"
            >
              Complete Purchase
            </button>
            <button
              onClick={() => setShowAlternatives(!showAlternatives)}
              className="flex-1 rounded-lg border border-white/30 bg-transparent px-6 py-3 font-semibold text-white transition hover:bg-white/5"
            >
              {showAlternatives ? (
                <>
                  <ChevronUp className="mr-2 inline h-4 w-4" />
                  Hide Alternatives
                </>
              ) : (
                <>
                  Show {alternatives.length} Alternatives
                  <ChevronDown className="ml-2 inline h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* View Negotiation History Button */}
          <button
            onClick={() => setShowNegotiationHistory(!showNegotiationHistory)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/30 bg-transparent px-6 py-3 font-semibold text-white transition hover:bg-white/5"
          >
            <MessageSquare className="h-4 w-4" />
            {showNegotiationHistory ? 'Hide' : 'View'} Negotiation Conversation
            {showNegotiationHistory ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {/* Renegotiate Button */}
          {onRenegotiate && (
            <button
              onClick={onRenegotiate}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/30 bg-transparent px-6 py-3 font-semibold text-white transition hover:bg-white/5"
            >
              <RefreshCw className="h-4 w-4" />
              Renegotiate
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-white/60">
          <span>{result.totalRounds} negotiation rounds</span>
          <span>•</span>
          <span>{result.duration}s elapsed</span>
        </div>
      </Card>
    </motion.div>
  )
}
