import { SYSTEM_PROMPT } from './knowledge'

export interface Env {
  OPENAI_API_KEY: string
  ALLOWED_ORIGIN: string
  OPENAI_MODEL?: string
  CHAT_RATE_LIMITER?: RateLimit
}

interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>
}

type IncomingMessage = { role: 'user' | 'assistant'; content: string }

const MAX_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 2000
const MODEL_FALLBACK = 'gpt-4o-mini'

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

function json(data: unknown, status: number, origin: string) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Origins are compared case-insensitively — browsers send hostnames lowercase
    // (e.g. GitHub Pages serves from "rsdv13.github.io" regardless of the username's casing).
    const requestOrigin = request.headers.get('Origin') ?? ''
    const isWildcard = env.ALLOWED_ORIGIN === '*'
    const originMatches = isWildcard || requestOrigin.toLowerCase() === env.ALLOWED_ORIGIN.toLowerCase()
    const allowOrigin = originMatches ? requestOrigin || env.ALLOWED_ORIGIN : env.ALLOWED_ORIGIN

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(allowOrigin) })
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, allowOrigin)
    }

    if (!originMatches) {
      return json({ error: 'Origin not allowed' }, 403, allowOrigin)
    }

    if (!env.OPENAI_API_KEY) {
      return json({ error: 'Server not configured: missing OPENAI_API_KEY' }, 500, allowOrigin)
    }

    // Optional Cloudflare Rate Limiting binding — degrades gracefully if not bound.
    if (env.CHAT_RATE_LIMITER) {
      const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
      const { success } = await env.CHAT_RATE_LIMITER.limit({ key: ip })
      if (!success) {
        return json({ error: 'Too many requests. Please slow down.' }, 429, allowOrigin)
      }
    }

    let body: { messages?: IncomingMessage[] }
    try {
      body = await request.json()
    } catch {
      return json({ error: 'Invalid JSON body' }, 400, allowOrigin)
    }

    const messages = Array.isArray(body.messages) ? body.messages : []
    if (messages.length === 0) {
      return json({ error: 'messages array is required' }, 400, allowOrigin)
    }
    if (messages.length > MAX_MESSAGES) {
      return json({ error: `Too many messages (max ${MAX_MESSAGES})` }, 400, allowOrigin)
    }
    for (const m of messages) {
      if (
        !m ||
        (m.role !== 'user' && m.role !== 'assistant') ||
        typeof m.content !== 'string' ||
        m.content.length === 0 ||
        m.content.length > MAX_MESSAGE_LENGTH
      ) {
        return json({ error: 'Malformed message in messages array' }, 400, allowOrigin)
      }
    }

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || MODEL_FALLBACK,
        stream: true,
        temperature: 0.6,
        max_tokens: 600,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      }),
    })

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => '')
      return json(
        { error: `Upstream error (${upstream.status}): ${text.slice(0, 300)}` },
        502,
        allowOrigin,
      )
    }

    // Pipe OpenAI's SSE stream straight through to the client.
    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        ...corsHeaders(allowOrigin),
      },
    })
  },
}
