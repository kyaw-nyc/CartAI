'use client'

import Link from 'next/link'
import Squares from './squares'

export function LandingContent() {
  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-[#0f2c4a] text-white">
      <Squares
        direction="diagonal"
        speed={0.45}
        squareSize={46}
        borderColor="rgba(255,255,255,0.08)"
        hoverFillColor="rgba(255,255,255,0.2)"
        className="absolute inset-0 opacity-70"
      />

      <div className="pointer-events-none relative z-10 flex min-h-screen flex-col">
        <div className="absolute left-0 right-0 top-0 h-[76px] bg-[#0b2239] opacity-90" />

        <header className="relative flex items-center justify-between px-8 py-5 lg:px-16">
          <Link
            href="/"
            className="pointer-events-auto flex items-center gap-3 text-base font-semibold tracking-tight text-white transition hover:text-white/80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-lg font-bold">PS</div>
            ProductScout
          </Link>
          <div className="pointer-events-auto flex items-center gap-3">
            <Link
              href="/learn-more"
              className="rounded-md border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-[#080705]"
            >
              Learn more
            </Link>
            <Link
              href="/learn-more#get-started"
              className="rounded-md bg-white px-5 py-2 text-sm font-semibold text-[#080705] shadow-lg transition hover:bg-white/90"
            >
              Start free pilot
            </Link>
          </div>
        </header>

        <main className="relative flex flex-1 items-center justify-center px-8 pb-20 pt-6 lg:px-16">
          <div className="pointer-events-auto mx-auto flex max-w-4xl flex-col items-start gap-8 text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
              Conversational sustainable shopping
            </div>
            <h1 className="text-5xl font-light leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              An AI agent that negotiates for greener, cheaper, or faster buys
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed text-white/85">
              Tell ProductScout what you need, pick one priority—speed, lowest carbon, or best price—and we deploy agents that negotiate live, verify claims, and return one transparent recommendation.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/learn-more#get-started"
                className="rounded-md bg-white px-7 py-4 text-base font-medium text-[#080705] shadow-xl transition hover:bg-white/90"
              >
                Launch negotiation
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
