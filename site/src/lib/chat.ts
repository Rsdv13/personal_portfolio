export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
}

const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL as string | undefined

export function isChatConfigured() {
  return Boolean(CHAT_API_URL)
}

/**
 * Streams a chat completion from the Cloudflare Worker proxy, which forwards
 * OpenAI's SSE stream verbatim. Calls `onDelta` with each new text chunk.
 */
export async function streamChatReply(
  history: ChatMessage[],
  onDelta: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (!CHAT_API_URL) {
    throw new Error('CHAT_NOT_CONFIGURED')
  }

  const res = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: history.map(({ role, content }) => ({ role, content })),
    }),
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
        const delta: string | undefined = json?.choices?.[0]?.delta?.content
        if (delta) onDelta(delta)
      } catch {
        // Ignore malformed SSE fragments (partial JSON split across chunks handled by buffer).
      }
    }
  }
}
