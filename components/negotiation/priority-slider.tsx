'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Zap, Leaf, DollarSign } from 'lucide-react'

export interface PriorityWeights {
  speed: number
  carbon: number
  price: number
}

interface PrioritySliderProps {
  onSelect: (weights: PriorityWeights) => void
}

export function PrioritySlider({ onSelect }: PrioritySliderProps) {
  const [speed, setSpeed] = useState(33)
  const [carbon, setCarbon] = useState(33)
  const [price, setPrice] = useState(34)

  const handleSpeedChange = (value: number) => {
    const remaining = 100 - value
    const carbonRatio = carbon / (carbon + price) || 0.5
    setSpeed(value)
    setCarbon(Math.round(remaining * carbonRatio))
    setPrice(100 - value - Math.round(remaining * carbonRatio))
  }

  const handleCarbonChange = (value: number) => {
    const remaining = 100 - value
    const speedRatio = speed / (speed + price) || 0.5
    setCarbon(value)
    setSpeed(Math.round(remaining * speedRatio))
    setPrice(100 - value - Math.round(remaining * speedRatio))
  }

  const handlePriceChange = (value: number) => {
    const remaining = 100 - value
    const speedRatio = speed / (speed + carbon) || 0.5
    setPrice(value)
    setSpeed(Math.round(remaining * speedRatio))
    setCarbon(100 - value - Math.round(remaining * speedRatio))
  }

  const handleSubmit = () => {
    onSelect({ speed, carbon, price })
  }

  const priorities = [
    {
      id: 'speed',
      icon: Zap,
      label: 'Fastest Delivery',
      description: 'How quickly you need the items delivered',
      value: speed,
      onChange: handleSpeedChange,
      color: '#3b82f6',
    },
    {
      id: 'carbon',
      icon: Leaf,
      label: 'Most Carbon-Efficient',
      description: 'Environmental impact and sustainability',
      value: carbon,
      onChange: handleCarbonChange,
      color: '#10b981',
    },
    {
      id: 'price',
      icon: DollarSign,
      label: 'Cheapest Price',
      description: 'Getting the best deal possible',
      value: price,
      onChange: handlePriceChange,
      color: '#f59e0b',
    },
  ]

  return (
    <div className="flex flex-col items-center justify-center space-y-8 px-4 py-8">
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-white">Set Your Priorities</h2>
        <p className="mt-3 text-base text-white/60">
          Adjust the sliders to set how much you care about each factor. They'll always total 100%.
        </p>
      </div>

      <div className="grid w-full max-w-4xl gap-6 sm:grid-cols-3">
        {priorities.map((priority, index) => {
          const Icon = priority.icon
          return (
            <motion.div
              key={priority.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex"
            >
              <Card className="group flex w-full flex-col border border-white/20 bg-white/5 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-lg bg-white/10 p-3">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="rounded-lg bg-white/10 px-3 py-1.5 text-lg font-bold text-white">
                    {priority.value}%
                  </span>
                </div>

                <div className="mb-4 space-y-1">
                  <h3 className="text-lg font-semibold text-white">{priority.label}</h3>
                  <p className="text-sm text-white/60">{priority.description}</p>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priority.value}
                  onChange={(e) => priority.onChange(parseInt(e.target.value))}
                  className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-white/10"
                  style={{
                    background: `linear-gradient(to right, ${priority.color} 0%, ${priority.color} ${priority.value}%, rgba(255,255,255,0.1) ${priority.value}%, rgba(255,255,255,0.1) 100%)`,
                  }}
                />
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="w-full max-w-4xl rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
        <p className="mb-2 text-sm font-medium text-white/80">Your Priority Breakdown:</p>
        <div className="flex gap-4 text-sm">
          <span className="text-blue-400">⚡ Speed: {speed}%</span>
          <span className="text-green-400">🌱 Carbon: {carbon}%</span>
          <span className="text-amber-400">💰 Price: {price}%</span>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleSubmit}
        className="w-full max-w-4xl rounded-xl bg-white px-6 py-4 text-lg font-semibold text-black transition hover:bg-white/90"
      >
        Start Negotiation
      </button>
    </div>
  )
}
