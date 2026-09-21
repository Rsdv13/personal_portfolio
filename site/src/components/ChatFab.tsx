import { Bot } from 'lucide-react'

export function ChatFab({ onOpen, hidden }: { onOpen: () => void; hidden: boolean }) {
  if (hidden) return null
  return (
    <button
      onClick={onOpen}
      aria-label="Open AI chat"
      className="fixed bottom-6 right-6 z-30 flex size-14 items-center justify-center rounded-full bg-gradient-to-r from-brand to-brand-2 text-ink shadow-xl shadow-brand/30 transition-transform hover:scale-110 sm:bottom-8 sm:right-8"
    >
      <span className="animate-pulse-slow absolute inset-0 rounded-full bg-brand-2/40 blur-md" />
      <Bot className="relative size-6" />
    </button>
  )
}
