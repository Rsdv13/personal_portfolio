import { skills } from '../data/profile'
import { SectionHeading } from './About'

export function Skills() {
  return (
    <section id="skills" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        eyebrow="Skills"
        title="Tools I reach for"
        description="A stack spanning cloud data engineering, big data, and applied machine learning."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(skills).map(([category, items]) => (
          <div key={category} className="card-glass section-fade rounded-2xl p-6">
            <p className="font-display text-sm font-semibold text-heading">{category}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {items.map((s) => (
                <span
                  key={s}
                  className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs text-body ring-1 ring-inset ring-line transition-colors hover:text-heading hover:ring-brand/40"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
