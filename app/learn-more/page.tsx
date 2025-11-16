import Link from 'next/link'
import Squares from '@/components/landing/squares'

const quickStats = [
  { title: 'Multi-agent orchestration', detail: 'Buyer + seller agents negotiate live to optimize one priority.' },
  { title: 'Greenwashing defense', detail: 'Cross-model verification keeps claims honest.' },
  { title: 'One clear choice', detail: 'Force-picks speed, carbon, or price to avoid decision fatigue.' },
]

const priorities = [
  {
    label: '⚡ Fastest Delivery',
    detail: 'Get it as soon as possible. Agents push for speed.',
    badge: 'Speed',
  },
  {
    label: '🌱 Most Carbon-Efficient',
    detail: 'Lowest environmental impact. Optimizes for CO₂ savings.',
    badge: 'Carbon',
  },
  {
    label: '💰 Cheapest Price',
    detail: 'Best deal that still meets requirements.',
    badge: 'Price',
  },
]

export default function LearnMorePage() {
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
              href="#get-started"
              className="rounded-md border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-[#080705]"
            >
              Get started
            </Link>
            <Link
              href="/"
              className="rounded-md bg-white px-5 py-2 text-sm font-semibold text-[#080705] shadow-lg transition hover:bg-white/90"
            >
              Back to home
            </Link>
          </div>
        </header>

        <main className="relative flex flex-1 flex-col gap-12 px-8 pb-16 pt-6 lg:px-16">
          <section className="pointer-events-auto mx-auto w-full max-w-6xl">
            <div className="grid gap-4 sm:grid-cols-3">
              {quickStats.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 shadow-lg backdrop-blur"
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-white/80">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="priorities" className="pointer-events-auto mx-auto w-full max-w-6xl">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur lg:p-8">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">Choose one priority</p>
                  <h2 className="text-2xl font-semibold text-white">ProductScout makes you pick speed, carbon, or price</h2>
                  <p className="mt-2 max-w-3xl text-sm text-white/80">
                    Simpler decisions → faster outcomes. Buyers set one objective; our agents negotiate and surface the best matching offer with transparent trade-offs.
                  </p>
                </div>
                <Link
                  href="#flow"
                  className="inline-flex items-center justify-center rounded-md border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-[#080705]"
                >
                  View the flow
                </Link>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {priorities.map((priority) => (
                  <div key={priority.label} className="rounded-2xl border border-white/15 bg-white/5 p-4 shadow-lg transition hover:translate-y-[-2px] hover:border-white/25">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{priority.label}</p>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/80">
                        {priority.badge}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-white/80">{priority.detail}</p>
                    <button className="mt-4 w-full rounded-md bg-white/90 px-3 py-2 text-sm font-semibold text-[#080705] transition hover:bg-white">
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="flow" className="pointer-events-auto relative mx-auto w-full max-w-6xl">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur lg:p-8">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">End-to-end journey</p>
                <h3 className="mt-1 text-xl font-semibold text-white">From intent to verified recommendation</h3>
                <div className="mt-4 space-y-4 text-sm text-white/85">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-white font-semibold">1) Capture the ask</p>
                    <p className="text-white/80">Text, voice, or image. Clarifies size, brand, budget, and constraints with quick replies.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-white font-semibold">2) Lock a single priority</p>
                    <p className="text-white/80">Speed, carbon, or price—one choice keeps the optimization simple and transparent.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-white font-semibold">3) Agents negotiate live</p>
                    <p className="text-white/80">Buyer agent haggles with multiple sellers; metrics update with CO₂, delivery, and price deltas.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-white font-semibold">4) Return one clear winner</p>
                    <p className="text-white/80">Explains why it won, shows CO₂ saved (e.g., “like not driving 45 miles”), and offers two alternatives.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur lg:p-8">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Live metrics</p>
                <h3 className="mt-1 text-xl font-semibold text-white">Watch the negotiation evolve</h3>
                <div className="mt-4 space-y-3 text-sm text-white/85">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <span>Current best offer</span>
                    <span className="font-semibold text-white">$87 · 12kg CO₂ · 5 days</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <span>Time elapsed</span>
                    <span className="font-semibold text-white">0:23 · Active sellers: 3</span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-white/80">Carbon comparison</p>
                    <div className="mt-2 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span>EcoSupply</span>
                        <span className="font-semibold text-emerald-200">12kg</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Average market</span>
                        <span className="font-semibold text-white">30kg</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Amazon baseline</span>
                        <span className="font-semibold text-white/80">32kg</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-white/80">Why this matters</p>
                    <p className="text-white">18kg CO₂ saved ≈ not driving 45 miles.</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Link
                    href="#get-started"
                    className="rounded-md bg-white px-4 py-3 text-center text-sm font-semibold text-[#080705] shadow-lg transition hover:bg-white/90"
                  >
                    Complete purchase
                  </Link>
                  <Link
                    href="#demo"
                    className="rounded-md border border-white/30 bg-transparent px-4 py-3 text-center text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-[#080705]"
                  >
                    Show alternatives
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section id="get-started" className="pointer-events-auto mx-auto w-full max-w-6xl">
            <div className="flex flex-col gap-4 rounded-3xl border border-white/15 bg-white/10 p-6 text-center shadow-2xl backdrop-blur lg:p-8">
              <h3 className="text-xl font-semibold text-white">Ready to pilot ProductScout?</h3>
              <p className="text-sm text-white/80">
                Drop in your catalog and policies, choose your priority, and let agents negotiate with sellers while we verify claims.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/"
                  className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-[#080705] shadow-lg transition hover:bg-white/90"
                >
                  Launch negotiation
                </Link>
                <Link
                  href="mailto:hello@productscout.ai"
                  className="rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-[#080705]"
                >
                  Contact sales
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
