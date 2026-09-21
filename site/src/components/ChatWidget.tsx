import { useEffect, useRef, useState } from 'react'
import { Bot, Send, Sparkles, User, X, RotateCcw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { isChatConfigured, streamChatReply, type ChatMessage } from '../lib/chat'
import { profile } from '../data/profile'

const SUGGESTIONS = [
  'What are you working on right now?',
  "What's your experience with Snowflake?",
  'Have you built AI agents before?',
  'Are you open to new roles?',
]

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `Hi, I'm **Suzie** — I manage ${profile.name}'s professional details. Ask me anything: what he's built, his stack, or whether he's open to new roles.`,
}

const NOT_CONFIGURED_NOTICE: ChatMessage = {
  id: 'not-configured',
  role: 'assistant',
  content:
    "Suzie isn't connected to a backend yet. Once the site owner deploys the Cloudflare Worker and sets `VITE_CHAT_API_URL`, she'll be able to chat for real. In the meantime, feel free to reach out directly via the contact section below!",
}

export function ChatWidget({ open, onClose }: { open: boolean; onClose: () => void }) {
  const configured = isChatConfigured()
  const [messages, setMessages] = useState<ChatMessage[]>([
    WELCOME,
    ...(configured ? [] : [NOT_CONFIGURED_NOTICE]),
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streaming])

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => document.getElementById('chat-input')?.focus(), 150)
      return () => clearTimeout(t)
    }
  }, [open])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || streaming || !configured) return

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: trimmed }
    const assistantId = crypto.randomUUID()
    const nextHistory = [...messages, userMsg]

    setMessages([...nextHistory, { id: assistantId, role: 'assistant', content: '' }])
    setInput('')
    setStreaming(true)
    setError(null)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      await streamChatReply(
        nextHistory,
        (chunk) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)),
          )
        },
        controller.signal,
      )
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('Something went wrong reaching Suzie. Please try again in a moment.')
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  function resetChat() {
    abortRef.current?.abort()
    setMessages([WELCOME, ...(configured ? [] : [NOT_CONFIGURED_NOTICE])])
    setError(null)
    setStreaming(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        aria-label="Close chat"
        onClick={onClose}
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
      />

      <div className="relative flex h-[85vh] w-full max-w-lg flex-col rounded-t-3xl border border-line bg-surface shadow-2xl sm:h-[640px] sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-r from-brand to-brand-2 text-ink">
              <Bot className="size-5" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold text-heading">Suzie</p>
              <p className="flex items-center gap-1.5 text-xs text-body">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                {configured ? 'Online' : 'Not connected'} · {profile.name}'s Assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={resetChat}
              aria-label="Reset conversation"
              className="rounded-full p-2 text-body transition-colors hover:bg-surface-2 hover:text-heading"
            >
              <RotateCcw className="size-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close chat"
              className="rounded-full p-2 text-body transition-colors hover:bg-surface-2 hover:text-heading"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.map((m) => (
            <Bubble key={m.id} message={m} pending={streaming && m.content === '' && m.role === 'assistant'} />
          ))}
          {error && <p className="text-center text-xs text-rose-400">{error}</p>}

          {messages.length <= 1 + (configured ? 0 : 1) && configured && (
            <div className="flex flex-wrap gap-2 pt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-left text-xs text-body transition-colors hover:border-brand/40 hover:text-heading"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
          className="flex items-center gap-2 border-t border-line p-4"
        >
          <input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!configured || streaming}
            placeholder={configured ? 'Ask Suzie anything…' : 'Suzie not connected yet'}
            className="flex-1 rounded-full border border-line bg-surface-2 px-4 py-2.5 text-sm text-heading placeholder:text-body/60 outline-none focus:border-brand/50 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!configured || streaming || !input.trim()}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-brand to-brand-2 text-ink transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

function Bubble({ message, pending }: { message: ChatMessage; pending: boolean }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <span
        className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-surface-2 text-body' : 'bg-gradient-to-r from-brand to-brand-2 text-ink'
        }`}
      >
        {isUser ? <User className="size-3.5" /> : <Sparkles className="size-3.5" />}
      </span>
      <div
        className={`chat-markdown max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'rounded-tr-sm bg-brand/15 text-heading'
            : 'rounded-tl-sm bg-surface-2 text-body'
        }`}
      >
        {pending ? (
          <span className="flex gap-1 py-1">
            <Dot />
            <Dot delay="0.15s" />
            <Dot delay="0.3s" />
          </span>
        ) : (
          <ReactMarkdown>{message.content}</ReactMarkdown>
        )}
      </div>
    </div>
  )
}

function Dot({ delay = '0s' }: { delay?: string }) {
  return (
    <span
      className="size-1.5 animate-bounce rounded-full bg-body"
      style={{ animationDelay: delay }}
    />
  )
}
