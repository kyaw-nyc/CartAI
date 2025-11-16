'use client'

import { useState } from 'react'
import { NegotiationResult } from '@/types/negotiation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatCarbon, formatDelivery } from '@/lib/utils/formatters'
import { getCarbonComparison } from '@/lib/utils/carbon'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, TrendingDown, Truck, Award, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'

interface ResultsCardProps {
  result: NegotiationResult
  negotiationMessages: import('@/types/negotiation').AgentMessage[]
  onComplete: () => void
  onShowAlternatives: () => void
}

export function ResultsCard({ result, negotiationMessages, onComplete, onShowAlternatives }: ResultsCardProps) {
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
      <Card className="border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-3 flex justify-center"
          >
            <div className="rounded-full bg-green-600 p-3">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <h2 className="text-2xl font-bold text-white">Perfect! Found the best option</h2>
          <p className="mt-1 text-sm text-white/60">Here&apos;s what we negotiated for you</p>
        </div>

        {/* Winner Card */}
        <div className="mb-6 rounded-lg border border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">🏆 {winner.sellerName}</h3>
            <Badge className="bg-green-600 text-white">Winner</Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center space-x-2 rounded-lg bg-white/5 p-3">
              <div className="rounded-full bg-blue-600/20 p-2">
                <TrendingDown className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-white/60">Price</p>
                <p className="text-lg font-bold text-white">{formatPrice(winner.price)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 rounded-lg bg-white/5 p-3">
              <div className="rounded-full bg-green-600/20 p-2">
                <span className="text-lg">🌱</span>
              </div>
              <div>
                <p className="text-xs text-white/60">Carbon</p>
                <p className="text-lg font-bold text-green-400">{formatCarbon(winner.carbonFootprint)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 rounded-lg bg-white/5 p-3">
              <div className="rounded-full bg-purple-600/20 p-2">
                <Truck className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-white/60">Delivery</p>
                <p className="text-lg font-bold text-white">{formatDelivery(winner.deliveryDays)}</p>
              </div>
            </div>
          </div>

          {/* Certifications */}
          {winner.certifications.length > 0 && (
            <div className="mt-4 flex items-center space-x-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-white/60">Verified:</span>
              <div className="flex flex-wrap gap-1">
                {winner.certifications.map((cert) => (
                  <Badge key={cert} variant="secondary" className="bg-yellow-600/20 text-xs text-yellow-400">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Environmental Impact */}
        {carbonSaved > 0 && (
          <div className="mb-6 rounded-lg border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-green-500/10 p-5">
            <div className="flex items-start space-x-3">
              <div className="rounded-full bg-emerald-600/20 p-2">
                <span className="text-2xl">🌍</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">Environmental Impact</h4>
                <p className="mt-1 text-sm text-white/80">
                  You&apos;re saving <span className="font-bold text-emerald-400">{formatCarbon(carbonSaved)}</span> vs
                  average!
                </p>
                <p className="mt-1 text-sm text-emerald-300">{getCarbonComparison(carbonSaved)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reasoning */}
        <div className="mb-6 rounded-lg bg-white/5 p-4">
          <h4 className="mb-2 text-sm font-semibold text-white">💡 Why this won:</h4>
          <p className="text-sm text-white/80">{reasoning}</p>
        </div>

        {/* Alternatives Section */}
        <AnimatePresence>
          {showAlternatives && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              <h4 className="text-sm font-semibold text-white">Alternative Options:</h4>
              {alternatives.map((alt, index) => (
                <div
                  key={alt.id}
                  className="rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold text-white">{alt.sellerName}</span>
                    <Badge variant="secondary" className="bg-white/10 text-white">
                      Option {index + 2}
                    </Badge>
                  </div>
                  <div className="grid gap-2 text-sm sm:grid-cols-3">
                    <div>
                      <span className="text-white/60">Price: </span>
                      <span className="font-medium text-white">{formatPrice(alt.price)}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Carbon: </span>
                      <span className="font-medium text-white">{formatCarbon(alt.carbonFootprint)}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Delivery: </span>
                      <span className="font-medium text-white">{formatDelivery(alt.deliveryDays)}</span>
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
              className="max-h-96 space-y-3 overflow-hidden"
            >
              <h4 className="text-sm font-semibold text-white">Negotiation History:</h4>
              <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg bg-white/5 p-4">
                {negotiationMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg p-3 ${
                      msg.role === 'buyer'
                        ? 'bg-blue-600/30 text-white'
                        : 'bg-white/10 text-white/90'
                    }`}
                  >
                    <div className="mb-1 text-xs font-semibold opacity-70">
                      {msg.role === 'buyer' ? 'Your Agent' : msg.sellerName}
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
              className="flex-1 rounded-lg bg-white px-6 py-3 font-semibold text-[#0a1929] transition hover:bg-white/90"
            >
              Complete Purchase
            </button>
            <button
              onClick={() => setShowAlternatives(!showAlternatives)}
              className="flex-1 rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
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
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            <MessageSquare className="h-4 w-4" />
            {showNegotiationHistory ? 'Hide' : 'View'} Negotiation Conversation
            {showNegotiationHistory ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-white/50">
          <span>{result.totalRounds} negotiation rounds</span>
          <span>•</span>
          <span>{result.duration}s elapsed</span>
        </div>
      </Card>
    </motion.div>
  )
}
