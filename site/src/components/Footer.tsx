import { profile } from '../data/profile'

export function Footer() {
  return (
    <footer className="border-t border-line px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-body sm:flex-row">
        <p>© {new Date().getFullYear()} {profile.name}. Built with React, Tailwind & an AI agent.</p>
        <p>Deployed on GitHub Pages</p>
      </div>
    </footer>
  )
}
