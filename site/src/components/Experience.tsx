import { Briefcase } from 'lucide-react'
import { experience } from '../data/profile'
import { SectionHeading } from './About'

export function Experience() {
  return (
    <section id="experience" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        eyebrow="Experience"
        title="Where I've made an impact"
        description="4+ years shipping production data platforms and AI systems for enterprise clients."
      />

      <div className="mt-14 space-y-10">
        {experience.map((job, i) => (
          <div key={job.company} className="section-fade relative grid gap-6 md:grid-cols-[220px_1fr]">
            <div className="flex md:flex-col md:items-start">
              <div className="flex items-center gap-3 md:flex-col md:items-start">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand-2 ring-1 ring-brand/30">
                  <Briefcase className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-heading">{job.period}</p>
                  <p className="text-xs text-body">{job.location}</p>
                </div>
              </div>
              {i < experience.length - 1 && (
                <div className="ml-5 mt-2 hidden h-full w-px bg-gradient-to-b from-brand/40 to-transparent md:block" />
              )}
            </div>

            <div className="card-glass rounded-2xl p-6 sm:p-8">
              <h3 className="font-display text-xl font-bold text-heading">{job.title}</h3>
              <p className="mt-1 text-sm font-medium text-brand-2">{job.company}</p>
              <p className="mt-5 text-sm leading-relaxed text-body">{job.story}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {job.highlights.map((h) => (
                  <span
                    key={h}
                    className="rounded-full border border-line bg-surface-2 px-3 py-1 text-xs text-body"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
