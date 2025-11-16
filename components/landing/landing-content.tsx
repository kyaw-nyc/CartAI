'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Send } from 'lucide-react'
import Squares from './squares'

export function LandingContent() {
  const [inputValue, setInputValue] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      // Redirect to login with the input value stored
      sessionStorage.setItem('pendingInput', inputValue)
      router.push('/login')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0">
        <Squares
          direction="diagonal"
          speed={0.45}
          squareSize={46}
          borderColor="rgba(255,255,255,0.25)"
          hoverFillColor="rgba(255,255,255,0.15)"
          className="h-full w-full"
        />
      </div>

      <div className="pointer-events-none relative z-10 flex min-h-screen flex-col">
        <div className="absolute left-0 right-0 top-0 h-[76px] bg-black/80" />

        <header className="relative flex items-center justify-between px-8 py-5 lg:px-16">
          <Link
            href="/"
            className="pointer-events-auto flex items-center gap-3 text-base font-semibold tracking-tight text-white transition hover:text-white/80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-lg font-bold">CA</div>
            CartAI
          </Link>
          <div className="pointer-events-auto flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-md border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-[#080705]"
            >
              Log in
            </Link>
          </div>
        </header>

        <main className="relative flex flex-1 items-center justify-center px-8 pb-20 pt-6 lg:px-16">
          <div className="pointer-events-auto mx-auto flex w-full max-w-4xl flex-col items-center gap-8 text-center">
            <h1 className="text-5xl font-light leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Welcome
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed text-white/85">
              We are the future of shopping. Tell CartAI what you need, pick one priority—speed, lowest carbon, or best price—and we deploy agents that negotiate live, verify claims, and return one transparent recommendation.
            </p>

            {/* Glossy Input Box */}
            <form onSubmit={handleSubmit} className="w-full max-w-2xl">
              <div className="relative rounded-xl border border-white/20 bg-white/5 p-4 shadow-2xl backdrop-blur-sm">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tell me what you need..."
                  rows={3}
                  className="w-full resize-none bg-transparent text-sm text-white/90 placeholder-white/40 outline-none"
                />

                {/* Send Button */}
                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="rounded-lg border border-white/30 bg-white p-2 text-black transition hover:bg-white/90 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-md bg-white px-7 py-4 text-base font-medium text-[#080705] shadow-xl transition hover:bg-white/90"
              >
                Sign up
              </Link>
              <Link
                href="/learn-more"
                className="rounded-md border border-white/40 bg-transparent px-7 py-4 text-base font-medium text-white transition hover:border-white hover:bg-white hover:text-[#080705]"
              >
                Learn more
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
