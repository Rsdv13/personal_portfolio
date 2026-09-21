import { ArrowRight, Sparkles, Download } from 'lucide-react'
import { profile } from '../data/profile'

export function Hero({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <section id="top" className="relative overflow-hidden pt-36 pb-24 sm:pt-44 sm:pb-32">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-blob absolute -left-32 top-0 size-[28rem] rounded-full bg-brand/25 blur-[110px]" />
        <div className="animate-blob absolute -right-32 top-40 size-[26rem] rounded-full bg-brand-2/20 blur-[110px] [animation-delay:4s]" />
        <div className="animate-blob absolute bottom-0 left-1/3 size-[24rem] rounded-full bg-brand-3/10 blur-[110px] [animation-delay:8s]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="section-fade mx-auto flex max-w-6xl flex-col items-center px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-4 py-1.5 text-xs font-medium text-body">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          Open to Data Engineering & AI Systems roles
        </div>

        <h1 className="font-display max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight text-heading sm:text-6xl">
          Hi, I'm <span className="text-gradient">Sudharsan Ragothaman</span>
          <br />
          I build data platforms and AI agents that scale.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-body sm:text-lg">
          {profile.tagline} Currently engineering Snowflake data platforms at{' '}
          <span className="text-heading">Javen Technologies</span>, and prototyping multi-agent
          AI systems on the side.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onOpenChat}
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-2 px-6 py-3 text-sm font-semibold text-ink shadow-lg shadow-brand/20 transition-transform hover:scale-105"
          >
            <Sparkles className="size-4" />
            Chat with my AI agent
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </button>
          <a
            href="/resume.pdf"
            download
            className="flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-heading transition-colors hover:border-brand/50 hover:bg-surface"
          >
            <Download className="size-4" />
            Download résumé
          </a>
        </div>

        <div className="mt-16 grid w-full max-w-3xl grid-cols-3 gap-4 border-t border-line pt-8">
          <Stat value="2+ yrs" label="Data Engineering" />
          <Stat value="Snowflake" label="SnowPro Certified" />
          <Stat value="LLM Agents" label="Built in production" />
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-xl font-bold text-heading sm:text-2xl">{value}</p>
      <p className="mt-1 text-xs text-body sm:text-sm">{label}</p>
    </div>
  )
}
