'use client'

import { Priority } from '@/types/product'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Zap, Leaf, DollarSign } from 'lucide-react'

interface PrioritySelectorProps {
  onSelect: (priority: Priority) => void
}

const PRIORITIES = [
  {
    id: 'speed' as Priority,
    icon: Zap,
    label: 'Fastest Delivery',
    description: 'Get it as soon as possible',
    detail: 'Optimizes for quickest delivery time',
  },
  {
    id: 'carbon' as Priority,
    icon: Leaf,
    label: 'Most Carbon-Efficient',
    description: 'Lowest environmental impact',
    detail: 'Prioritizes sustainability and certifications',
  },
  {
    id: 'price' as Priority,
    icon: DollarSign,
    label: 'Cheapest Price',
    description: 'Best deal for your budget',
    detail: 'Focuses on getting the lowest price',
  },
]

export function PrioritySelector({ onSelect }: PrioritySelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 px-4 py-8">
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-white">What matters most to you?</h2>
        <p className="mt-3 text-base text-white/60">Choose one priority to optimize your search</p>
      </div>

      <div className="grid w-full max-w-4xl gap-6 sm:grid-cols-3">
        {PRIORITIES.map((priority, index) => {
          const Icon = priority.icon
          return (
            <motion.div
              key={priority.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex"
            >
              <Card
                onClick={() => onSelect(priority.id)}
                className="group flex w-full cursor-pointer flex-col border border-white/20 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10"
              >
                <div className="flex flex-1 flex-col items-start space-y-4">
                  <div className="rounded-lg bg-white/10 p-3">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-semibold text-white">{priority.label}</h3>
                    <p className="text-sm text-white/60">{priority.description}</p>
                    <p className="text-xs text-white/40">{priority.detail}</p>
                  </div>
                  <button className="mt-auto w-full rounded-lg border border-white/30 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90">
                    Select
                  </button>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
