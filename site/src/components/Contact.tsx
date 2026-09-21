import type { ReactNode } from 'react'
import { Mail, Phone, MessageCircle } from 'lucide-react'
import { profile } from '../data/profile'
import { SectionHeading } from './About'
import { LinkedInIcon, GitHubIcon } from './BrandIcons'

export function Contact({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <section id="contact" className="relative mx-auto max-w-6xl px-6 py-24">
      <SectionHeading
        eyebrow="Contact"
        title="Let's build something"
        description="Open to Data Engineering, Data Science, and AI Systems roles — or just a conversation about pipelines and agents."
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ContactCard
          icon={<Mail className="size-5" />}
          label="Email"
          value={profile.email}
          href={`mailto:${profile.email}`}
        />
        <ContactCard
          icon={<Phone className="size-5" />}
          label="Phone"
          value={profile.phone}
          href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`}
        />
        <ContactCard
          icon={<LinkedInIcon className="size-5" />}
          label="LinkedIn"
          value="in/sudharsan-ragothaman"
          href={profile.linkedin}
        />
        <ContactCard
          icon={<GitHubIcon className="size-5" />}
          label="GitHub"
          value="@Rsdv13"
          href={profile.github}
        />
      </div>

      <div className="card-glass section-fade mt-8 flex flex-col items-center gap-4 rounded-2xl p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-brand to-brand-2 text-ink">
          <MessageCircle className="size-6" />
        </span>
        <p className="font-display text-lg font-semibold text-heading">
          Not sure where to start?
        </p>
        <p className="max-w-md text-sm text-body">
          Ask my AI agent — it knows my whole background and can answer questions about my
          experience, skills, and availability in real time.
        </p>
        <button
          onClick={onOpenChat}
          className="rounded-full bg-gradient-to-r from-brand to-brand-2 px-6 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-105"
        >
          Start a conversation
        </button>
      </div>
    </section>
  )
}

function ContactCard({
  icon,
  label,
  value,
  href,
}: {
  icon: ReactNode
  label: string
  value: string
  href: string
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noreferrer"
      className="card-glass section-fade group flex flex-col items-start gap-3 rounded-2xl p-5 transition-colors hover:border-brand/40"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-surface-2 text-brand-2 ring-1 ring-line transition-colors group-hover:ring-brand/40">
        {icon}
      </span>
      <div>
        <p className="text-xs text-body">{label}</p>
        <p className="truncate text-sm font-medium text-heading">{value}</p>
      </div>
    </a>
  )
}
