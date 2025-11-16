import Link from 'next/link'
import Squares from '@/components/landing/squares'

export default function LearnMorePage() {
  return (
    <div className="relative isolate min-h-screen w-full bg-[#0a1a2e] text-white">
      <Squares
        direction="diagonal"
        speed={0.45}
        squareSize={46}
        borderColor="rgba(255,255,255,0.06)"
        hoverFillColor="rgba(255,255,255,0.08)"
        className="pointer-events-none fixed inset-0 opacity-30"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-10 lg:px-10">
        <header className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0b2239] px-4 py-4">
          <Link href="/" className="flex items-center gap-3 text-base font-semibold text-white">
            <span className="leading-none">ProductScout</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="rounded-md border border-white/25 px-3 py-2 text-white">
              Back to home
            </Link>
            <Link href="#get-started" className="rounded-md bg-white px-3 py-2 text-[#080705] font-semibold">
              Get started
            </Link>
          </div>
        </header>

        <main className="space-y-8">
          <section className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Conversational sustainable shopping</p>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              How ProductScout negotiates for speed, carbon, or price
            </h1>
            <p className="max-w-3xl text-base text-white/80">
              Give us your request, pick a single priority, and our buyer and seller agents negotiate live. We verify claims across models and return one transparent recommendation with clear trade-offs.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white">At a glance</h2>
            <ul className="space-y-2 text-sm text-white/85">
              <li>• Multi-agent negotiation to optimize one priority (speed, carbon, or price).</li>
              <li>• Verification step to reduce greenwashing and keep claims honest.</li>
              <li>• Single recommendation plus concise reasoning and two alternatives.</li>
            </ul>
          </section>

          <section id="priorities" className="space-y-4 border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white">Choose one priority</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { title: '⚡ Fastest delivery', detail: 'Pay a bit more to get it soonest.' },
                { title: '🌱 Most carbon-efficient', detail: 'Minimize CO₂ and favor verified options.' },
                { title: '💰 Cheapest price', detail: 'Stay on budget while meeting the basics.' },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border border-white/15 p-4">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-white/75">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="flow" className="space-y-4 border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white">Simple flow</h3>
            <ol className="space-y-3 text-sm text-white/85">
              <li>1) Share what you need (text/voice/image) and basic constraints.</li>
              <li>2) Pick one priority: speed, carbon, or price.</li>
              <li>3) Buyer agent negotiates with multiple sellers; metrics update live.</li>
              <li>4) Get one winner with reasoning, carbon context, and two alternatives.</li>
            </ol>
          </section>

          <section className="space-y-3 border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white">Live metrics we track</h3>
            <ul className="space-y-2 text-sm text-white/85">
              <li>• Current best offer: price, CO₂, delivery.</li>
              <li>• Time elapsed and active sellers.</li>
              <li>• Carbon comparison vs average and common baselines.</li>
              <li>• Why-this-won summary tied to your chosen priority.</li>
            </ul>
          </section>

          <section id="get-started" className="space-y-4 border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white">Get started</h3>
            <p className="text-sm text-white/80">
              Drop in your catalog and basic policies. We align tone and guardrails, then run a short pilot. No fancy setup required.
            </p>
            <p className="text-sm text-white/75">
              Email hello@productscout.ai to kick off a pilot or ask questions. We’ll respond with next steps.
            </p>
          </section>
        </main>
      </div>
    </div>
  )
}
