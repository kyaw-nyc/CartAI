'use client'

import { Priority } from '@/types/product'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'

interface PrioritySelectorProps {
  onSelect: (priority: Priority) => void
}

const PRIORITIES = [
  {
    id: 'speed' as Priority,
    emoji: '⚡',
    label: 'Fastest Delivery',
    description: 'Get it as soon as possible',
    detail: 'Optimizes for quickest delivery time',
    color: 'from-yellow-500/20 to-orange-500/20',
    borderColor: 'hover:border-yellow-500/50',
  },
  {
    id: 'carbon' as Priority,
    emoji: '🌱',
    label: 'Most Carbon-Efficient',
    description: 'Lowest environmental impact',
    detail: 'Prioritizes sustainability and certifications',
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'hover:border-green-500/50',
  },
  {
    id: 'price' as Priority,
    emoji: '💰',
    label: 'Cheapest Price',
    description: 'Best deal for your budget',
    detail: 'Focuses on getting the lowest price',
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'hover:border-blue-500/50',
  },
]

export function PrioritySelector({ onSelect }: PrioritySelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white">What matters most to you?</h2>
        <p className="mt-2 text-sm text-white/60">Choose one priority to optimize your search</p>
      </div>

      <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-3">
        {PRIORITIES.map((priority, index) => (
          <motion.div
            key={priority.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              onClick={() => onSelect(priority.id)}
              className={`group cursor-pointer border border-white/10 bg-gradient-to-br ${priority.color} p-6 transition-all duration-300 hover:scale-105 ${priority.borderColor}`}
            >
              <div className="flex flex-col items-center space-y-3 text-center">
                <span className="text-5xl">{priority.emoji}</span>
                <h3 className="text-lg font-semibold text-white">{priority.label}</h3>
                <p className="text-sm text-white/70">{priority.description}</p>
                <p className="text-xs text-white/50">{priority.detail}</p>

                <button className="mt-4 w-full rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20">
                  Select
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
