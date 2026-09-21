// Chat widget: open/close, message state, SSE streaming from /api/chat, and a small
// dependency-free markdown-lite renderer (bold, links, bullet lists) for Suzie's replies.

const CHAT_CONFIGURED = Boolean(window.CHAT_CONFIGURED)
const ASSISTANT_NAME = window.ASSISTANT_NAME || 'Sudharsan'

const ICON_SPARKLES =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5" aria-hidden="true"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path><path d="M20 2v4"></path><path d="M22 4h-4"></path><circle cx="4" cy="20" r="2"></circle></svg>'
const ICON_USER =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'

const SUGGESTIONS = [
  'What are you working on right now?',
  "What's your experience with Snowflake?",
  'Have you built AI agents before?',
  'Are you open to new roles?',
]

function welcomeMessage() {
  return {
    id: 'welcome',
    role: 'assistant',
    content: `Hi, I'm **Suzie** — I manage ${ASSISTANT_NAME}'s professional details. Ask me anything: what he's built, his stack, or whether he's open to new roles.`,
  }
}

function notConfiguredNotice() {
  return {
    id: 'not-configured',
    role: 'assistant',
    content:
      "Suzie isn't connected yet — the site owner needs to set `OPENAI_API_KEY` on the server. In the meantime, feel free to reach out directly via the contact section below!",
  }
}

function initialMessages() {
  return CHAT_CONFIGURED ? [welcomeMessage()] : [welcomeMessage(), notConfiguredNotice()]
}

// --- Markdown-lite: escape first, then apply a small, safe set of substitutions. ---
function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

function renderMarkdownLite(text) {
  let html = escapeHtml(text)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')

  const lines = html.split('\n')
  const out = []
  let inList = false
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (line.startsWith('- ')) {
      if (!inList) {
        out.push('<ul>')
        inList = true
      }
      out.push(`<li>${line.slice(2)}</li>`)
    } else {
      if (inList) {
        out.push('</ul>')
        inList = false
      }
      if (line.length) out.push(`<p>${line}</p>`)
    }
  }
  if (inList) out.push('</ul>')
  return out.join('')
}

// --- Chat state ---
let messages = initialMessages()
let streaming = false
let abortController = null

const modal = document.getElementById('chat-modal')
const fab = document.getElementById('chat-fab')
const backdrop = document.getElementById('chat-backdrop')
const closeBtn = document.getElementById('chat-close')
const resetBtn = document.getElementById('chat-reset')
const messagesEl = document.getElementById('chat-messages')
const form = document.getElementById('chat-form')
const input = document.getElementById('chat-input')
const statusEl = document.getElementById('chat-status')

function openChat() {
  modal.classList.remove('hidden')
  modal.classList.add('flex')
  fab.classList.add('hidden')
  setTimeout(() => input && input.focus(), 150)
}

function closeChat() {
  modal.classList.add('hidden')
  modal.classList.remove('flex')
  fab.classList.remove('hidden')
}

document.querySelectorAll('[data-chat-trigger]').forEach((el) => el.addEventListener('click', openChat))
backdrop.addEventListener('click', closeChat)
closeBtn.addEventListener('click', closeChat)

function scrollToBottom() {
  messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' })
}

function bubbleNode(message, pending) {
  const isUser = message.role === 'user'
  const wrap = document.createElement('div')
  wrap.className = `flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`
  wrap.dataset.id = message.id

  const avatar = document.createElement('span')
  avatar.className = `mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${
    isUser ? 'bg-surface-2 text-body' : 'bg-gradient-to-r from-brand to-brand-2 text-ink'
  }`
  avatar.innerHTML = isUser ? ICON_USER : ICON_SPARKLES

  const bubble = document.createElement('div')
  bubble.className = `chat-markdown max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
    isUser ? 'rounded-tr-sm bg-brand/15 text-heading' : 'rounded-tl-sm bg-surface-2 text-body'
  }`

  if (pending) {
    bubble.innerHTML =
      '<span class="flex gap-1 py-1">' +
      '<span class="size-1.5 animate-bounce rounded-full bg-body"></span>' +
      '<span class="size-1.5 animate-bounce rounded-full bg-body" style="animation-delay:0.15s"></span>' +
      '<span class="size-1.5 animate-bounce rounded-full bg-body" style="animation-delay:0.3s"></span>' +
      '</span>'
  } else {
    bubble.innerHTML = renderMarkdownLite(message.content)
  }

  wrap.append(avatar, bubble)
  return wrap
}

function renderSuggestions() {
  if (!CHAT_CONFIGURED || messages.length > 1) return null
  const wrap = document.createElement('div')
  wrap.className = 'flex flex-wrap gap-2 pt-2'
  for (const s of SUGGESTIONS) {
    const btn = document.createElement('button')
    btn.className =
      'rounded-full border border-line bg-surface-2 px-3 py-1.5 text-left text-xs text-body transition-colors hover:border-brand/40 hover:text-heading'
    btn.textContent = s
    btn.addEventListener('click', () => send(s))
    wrap.appendChild(btn)
  }
  return wrap
}

function renderMessages(pendingId, errorText) {
  messagesEl.innerHTML = ''
  for (const m of messages) {
    messagesEl.appendChild(bubbleNode(m, m.id === pendingId))
  }
  if (errorText) {
    const p = document.createElement('p')
    p.className = 'text-center text-xs text-rose-400'
    p.textContent = errorText
    messagesEl.appendChild(p)
  }
  const suggestions = renderSuggestions()
  if (suggestions) messagesEl.appendChild(suggestions)
  scrollToBottom()
}

async function streamChatReply(history, onDelta, signal) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
    signal,
  })

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '')
    throw new Error(`Chat request failed (${res.status}): ${text || res.statusText}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const parts = buffer.split('\n\n')
    buffer = parts.pop() ?? ''

    for (const part of parts) {
      const line = part.trim()
      if (!line.startsWith('data:')) continue
      const data = line.slice(5).trim()
      if (data === '[DONE]') return

      try {
        const json = JSON.parse(data)
        const delta = json && json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content
        if (delta) onDelta(delta)
      } catch {
        // Ignore malformed SSE fragments (partial JSON split across chunks handled by buffer).
      }
    }
  }
}

async function send(text) {
  const trimmed = text.trim()
  if (!trimmed || streaming || !CHAT_CONFIGURED) return

  const userMsg = { id: crypto.randomUUID(), role: 'user', content: trimmed }
  const assistantId = crypto.randomUUID()
  const nextHistory = [...messages, userMsg]

  messages = [...nextHistory, { id: assistantId, role: 'assistant', content: '' }]
  input.value = ''
  streaming = true
  renderMessages(assistantId, null)

  abortController = new AbortController()

  try {
    await streamChatReply(
      nextHistory,
      (chunk) => {
        const msg = messages.find((m) => m.id === assistantId)
        if (msg) msg.content += chunk
        renderMessages(null, null)
      },
      abortController.signal,
    )
  } catch (err) {
    if (err.name !== 'AbortError') {
      renderMessages(null, 'Something went wrong reaching Suzie. Please try again in a moment.')
    }
  } finally {
    streaming = false
    abortController = null
  }
}

function resetChat() {
  if (abortController) abortController.abort()
  messages = initialMessages()
  streaming = false
  renderMessages(null, null)
}

resetBtn.addEventListener('click', resetChat)

form.addEventListener('submit', (e) => {
  e.preventDefault()
  send(input.value)
})

renderMessages(null, null)
