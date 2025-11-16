'use client'

import { AIProvider, getAllProviders } from '@/lib/api/ai-providers'
import { cn } from '@/lib/utils'

interface ProviderTabsProps {
  activeProvider: AIProvider
  onProviderChange: (provider: AIProvider) =>void
}

export function ProviderTabs({ activeProvider, onProviderChange }: ProviderTabsProps) {
  const providers = getAllProviders()

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive
        ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
        : 'text-white/60 border-white/20 hover:bg-blue-500/10 hover:border-blue-500/30',
      purple: isActive
        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
        : 'text-white/60 border-white/20 hover:bg-purple-500/10 hover:border-purple-500/30',
      green: isActive
        ? 'bg-green-500/20 text-green-300 border-green-500/50'
        : 'text-white/60 border-white/20 hover:bg-green-500/10 hover:border-green-500/30',
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="flex items-center gap-2 border-b border-white/10 bg-black/40 px-6 py-3 backdrop-blur-sm">
      <div className="text-sm font-medium text-white/60">AI Provider:</div>
      <div className="flex gap-2">
        {providers.map((provider) => {
          const isActive = provider.id === activeProvider
          return (
            <button
              key={provider.id}
              onClick={() => onProviderChange(provider.id)}
              className={cn(
                'rounded-lg border px-4 py-2 text-sm font-medium transition',
                getColorClasses(provider.color, isActive)
              )}
            >
              <div className="flex flex-col items-start">
                <span className="font-semibold">{provider.name}</span>
                <span className="text-xs opacity-75">{provider.description}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
