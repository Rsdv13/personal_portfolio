import { FlaskConical, Bot } from 'lucide-react'
import { research } from '../data/profile'
import { SectionHeading } from './About'

const icons = [FlaskConical, Bot, FlaskConical]

export function Projects() {
  return (
    <section id="projects" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        eyebrow="Projects & Research"
        title="Things I've built"
        description="Applied ML and computer vision research, plus this site's own AI agent."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {research.map((proj, i) => {
          const Icon = icons[i % icons.length]
          return (
            <div
              key={proj.title}
              className="card-glass section-fade group flex flex-col rounded-2xl p-6 transition-transform hover:-translate-y-1"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-2/10 text-brand-2 ring-1 ring-brand-2/30">
                <Icon className="size-5" />
              </span>
              <h3 className="font-display mt-4 text-lg font-bold text-heading">{proj.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {proj.bullets.map((b) => (
                  <li key={b} className="text-sm leading-relaxed text-body">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <div className="card-glass section-fade mt-8 flex flex-col items-start gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand-2 ring-1 ring-brand/30">
            <Bot className="size-5" />
          </span>
          <div>
            <h3 className="font-display text-lg font-bold text-heading">This site's AI agent</h3>
            <p className="mt-1 text-sm text-body">
              A retrieval-grounded chat agent (OpenAI, served through a Cloudflare Worker) trained
              on my resume and experience — ask it anything about my background.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
