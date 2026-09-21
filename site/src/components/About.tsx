import type { ReactNode } from 'react'
import { MapPin, GraduationCap, Award } from 'lucide-react'
import { profile, achievements, education } from '../data/profile'

export function About() {
  return (
    <section id="about" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading eyebrow="About" title="The short version" />

      <div className="mt-12 grid gap-10 md:grid-cols-5">
        <div className="card-glass section-fade relative rounded-3xl p-1 md:col-span-2">
          <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-brand/20 via-surface to-brand-2/10">
            <InitialsAvatar name={profile.name} />
          </div>
        </div>

        <div className="section-fade md:col-span-3">
          <p className="text-lg leading-relaxed text-body">{profile.summary}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <InfoRow icon={<MapPin className="size-4" />} label="Based in" value={profile.location} />
            <InfoRow
              icon={<GraduationCap className="size-4" />}
              label="Education"
              value="M.S. Engineering Data Science, University of Houston"
            />
          </div>

          <div className="mt-8">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-heading">
              <Award className="size-4 text-brand-2" />
              Certifications & Achievements
            </p>
            <div className="flex flex-wrap gap-2">
              {achievements.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-body"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {education.map((ed) => (
          <div key={ed.degree} className="card-glass section-fade rounded-2xl p-6">
            <p className="font-display font-semibold text-heading">{ed.degree}</p>
            <p className="mt-1 text-sm text-brand-2">{ed.school}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-body">
              <span>{ed.period}</span>
              <span className="text-line">•</span>
              <span>GPA {ed.gpa}</span>
            </div>
            <p className="mt-3 text-sm text-body">{ed.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="section-fade">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-2">{eyebrow}</p>
      <h2 className="font-display mt-3 text-3xl font-bold text-heading sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 max-w-2xl text-body">{description}</p>}
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-line bg-surface/60 p-4">
      <span className="mt-0.5 text-brand-2">{icon}</span>
      <div>
        <p className="text-xs text-body">{label}</p>
        <p className="text-sm font-medium text-heading">{value}</p>
      </div>
    </div>
  )
}

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
  return (
    <span className="font-display text-6xl font-bold text-heading/90">
      {initials}
    </span>
  )
}
