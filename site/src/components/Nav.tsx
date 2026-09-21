import { useEffect, useState } from 'react'
import { Menu, X, MessageCircle } from 'lucide-react'
import { profile } from '../data/profile'

const links = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
]

export function Nav({ onOpenChat }: { onOpenChat: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all ${
        scrolled ? 'bg-ink/80 border-b border-line backdrop-blur-lg' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="font-display text-lg font-semibold text-heading">
          Sudharsan<span className="text-gradient">.dev</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-body transition-colors hover:text-heading"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 rounded-full bg-brand/10 px-4 py-2 text-sm font-medium text-brand-2 ring-1 ring-inset ring-brand/30 transition-all hover:bg-brand/20"
          >
            <MessageCircle className="size-4" />
            Ask my AI
          </button>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-heading px-4 py-2 text-sm font-semibold text-ink transition-transform hover:scale-105"
          >
            LinkedIn
          </a>
        </div>

        <button
          className="text-heading md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-surface px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm text-body hover:text-heading"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => {
                setOpen(false)
                onOpenChat()
              }}
              className="flex w-fit items-center gap-2 rounded-full bg-brand/10 px-4 py-2 text-sm font-medium text-brand-2 ring-1 ring-inset ring-brand/30"
            >
              <MessageCircle className="size-4" />
              Ask my AI
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
