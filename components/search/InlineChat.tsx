'use client'

import { useEffect, useRef, useState } from 'react'

interface ProviderCard {
  id: string
  name: string
  phone: string | null
  website: string | null
  address: string | null
  distance_miles: number | null
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  providers?: ProviderCard[]
  detectedLanguage?: string
}

const FILTER_NUDGE: Record<string, string> = {
  en: 'Want to narrow these down? Just ask — for example: "show Spanish-speaking providers", "only free or sliding scale", or "for seniors".',
  es: '¿Quieres filtrar los resultados? Solo pregunta — por ejemplo: "proveedores que hablan español", "solo gratis o precio escalonado", o "para personas mayores".',
  pt: 'Quer filtrar esses resultados? Basta perguntar — por exemplo: "provedores que falam português", "apenas gratuito ou com preço variável", ou "para idosos".',
  ht: 'Ou vle filtre rezilta yo? Mande jis — pa egzanp: "founisè ki pale kreyòl", "gratis oswa pri ekselèt sèlman", oswa "pou granmoun".',
  'zh-cn': '想缩小范围吗？直接问我就好 — 例如："提供普通话服务的机构"、"免费或按收入收费"或"适合老年人"。',
  vi: 'Bạn muốn thu hẹp kết quả? Chỉ cần hỏi — ví dụ: "nhà cung cấp nói tiếng Việt", "chỉ miễn phí hoặc trả theo thu nhập", hoặc "cho người cao tuổi".',
  ar: 'هل تريد تضييق النتائج؟ فقط اسأل — على سبيل المثال: "مزودون يتحدثون العربية"، "مجاني أو بأسعار مرنة فقط"، أو "لكبار السن".',
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

interface InlineChatProps {
  clientId: string
  slug: string
  onHasMessages: (has: boolean) => void
}

const INTRO = [
  'Hi! I am here to help.',
  'Let me know what I can help you find. You can respond in any language.',
]

export function InlineChat({ clientId, slug, onHasMessages }: InlineChatProps) {
  const [sessionId] = useState(() => crypto.randomUUID())
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [introMessages, setIntroMessages] = useState<string[]>([])
  const [introTyping, setIntroTyping] = useState(true)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Staged intro sequence: dots → msg1 → dots → msg2
  useEffect(() => {
    const t1 = setTimeout(() => {
      setIntroMessages([INTRO[0]])
      setIntroTyping(true)
      const t2 = setTimeout(() => {
        setIntroMessages(INTRO)
        setIntroTyping(false)
      }, 1200)
      return () => clearTimeout(t2)
    }, 900)
    return () => clearTimeout(t1)
  }, [])

  useEffect(() => {
    onHasMessages(messages.length > 0)
  }, [messages.length, onHasMessages])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading, introMessages, introTyping])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setError(null)
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, session_id: sessionId, message: text }),
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        providers: data.providers ?? undefined,
        detectedLanguage: data.detected_language ?? 'en',
      }])
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setMessages([])
    setInput('')
    setError(null)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--ds-border-subtle)',
        borderRadius: 'var(--ds-radius-lg)',
        background: 'var(--ds-bg-default)',
        boxShadow: 'var(--ds-shadow-sm)',
        overflow: 'hidden',
      }}>
        {/* Message thread — scrollable */}
        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-label="Chat conversation"
          style={{
            minHeight: messages.length === 0 ? 72 : 260,
            maxHeight: 480,
            overflowY: 'auto',
            padding: 'var(--ds-space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-space-3)',
            transition: 'min-height 0.2s ease',
          }}
        >
          {/* Intro sequence */}
          {introMessages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div className="chat-bubble-assistant" style={{
                maxWidth: '75%',
                padding: 'var(--ds-space-2) var(--ds-space-3)',
                background: 'var(--ds-bg-muted)',
                color: 'var(--ds-text-primary)',
                fontFamily: 'var(--ds-font-sans)',
                fontSize: 'var(--ds-text-sm)',
                lineHeight: 1.6,
              }}>
                {msg}
              </div>
            </div>
          ))}
          {(introTyping || introMessages.length === 0) && (
            <div style={{ display: 'flex', gap: 5, padding: 'var(--ds-space-1)', alignItems: 'center' }}>
              {[0, 0.2, 0.4].map((delay, i) => (
                <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ds-text-tertiary)', animation: 'chatDot 1.2s infinite', animationDelay: `${delay}s`, display: 'inline-block' }} />
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-space-2)',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div
                className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}
                style={{
                  maxWidth: '75%',
                  padding: 'var(--ds-space-2) var(--ds-space-3)',
                  background: msg.role === 'user' ? 'var(--ds-brand-600)' : 'var(--ds-bg-muted)',
                  color: msg.role === 'user' ? '#fff' : 'var(--ds-text-primary)',
                  fontFamily: 'var(--ds-font-sans)',
                  fontSize: 'var(--ds-text-sm)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.content}
              </div>

              {msg.providers && msg.providers.length > 0 && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-2)' }}>
                  {msg.providers.map(p => (
                    <div key={p.id} style={{
                      background: 'var(--ds-bg-subtle)',
                      border: '1px solid var(--ds-border-subtle)',
                      borderRadius: 'var(--ds-radius-md)',
                      padding: 'var(--ds-space-3)',
                    }}>
                      <a
                        href={`/provider/${p.id}?slug=${slug}`}
                        style={{
                          display: 'block',
                          fontFamily: 'var(--ds-font-sans)',
                          fontSize: 'var(--ds-text-sm)',
                          fontWeight: 600,
                          color: 'var(--ds-brand-600)',
                          textDecoration: 'none',
                          marginBottom: '2px',
                        }}
                      >
                        {p.name}
                      </a>
                      {p.address && (
                        <p style={{ margin: '0 0 var(--ds-space-1)', fontFamily: 'var(--ds-font-sans)', fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-tertiary)' }}>
                          {p.address}{p.distance_miles != null ? ` · ${p.distance_miles.toFixed(1)} mi` : ''}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: 'var(--ds-space-3)', flexWrap: 'wrap' }}>
                        {p.phone && (
                          <a href={`tel:${p.phone}`} style={{ fontFamily: 'var(--ds-font-sans)', fontSize: 'var(--ds-text-xs)', fontWeight: 500, color: 'var(--ds-brand-600)' }}>
                            {p.phone}
                          </a>
                        )}
                        {p.website && (
                          <a href={p.website} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--ds-font-sans)', fontSize: 'var(--ds-text-xs)', fontWeight: 500, color: 'var(--ds-brand-600)' }}>
                            Website →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  <p className="chat-bubble-assistant" style={{
                    margin: 0,
                    padding: 'var(--ds-space-2) var(--ds-space-3)',
                    background: 'var(--ds-bg-muted)',
                    color: 'var(--ds-text-secondary)',
                    fontFamily: 'var(--ds-font-sans)',
                    fontSize: 'var(--ds-text-xs)',
                    lineHeight: 1.5,
                  }}>
                    {FILTER_NUDGE[msg.detectedLanguage ?? 'en'] ?? FILTER_NUDGE.en}
                  </p>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 5, padding: 'var(--ds-space-1)', alignItems: 'center' }}>
              {[0, 0.2, 0.4].map((delay, i) => (
                <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ds-text-tertiary)', animation: 'chatDot 1.2s infinite', animationDelay: `${delay}s`, display: 'inline-block' }} />
              ))}
            </div>
          )}

          {error && (
            <p style={{ margin: 0, fontFamily: 'var(--ds-font-sans)', fontSize: 'var(--ds-text-xs)', color: 'var(--ds-error-base)' }}>
              {error}
            </p>
          )}

        </div>

        {/* Input bar — pinned to bottom */}
        <div style={{
          borderTop: '1px solid var(--ds-border-subtle)',
          padding: 'var(--ds-space-2) var(--ds-space-3)',
          display: 'flex',
          gap: 'var(--ds-space-2)',
          alignItems: 'flex-end',
          background: 'var(--ds-bg-default)',
        }}>
          {messages.length > 0 && (
            <button
              onClick={reset}
              title="Start over"
              style={{
                flexShrink: 0,
                background: 'none',
                border: '1px solid var(--ds-border-strong)',
                borderRadius: 'var(--ds-radius-md)',
                padding: '6px 8px',
                cursor: 'pointer',
                color: 'var(--ds-text-tertiary)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1 8a7 7 0 1 0 1.5-4.3"/>
                <path d="M1 2v4h4"/>
              </svg>
            </button>
          )}
          <textarea
            ref={inputRef}
            aria-label="Type your message"
            placeholder="What do you need help with?"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{
              flex: 1,
              fontFamily: 'var(--ds-font-sans)',
              fontSize: 'var(--ds-text-sm)',
              border: '1px solid var(--ds-border-default)',
              borderRadius: 'var(--ds-radius-md)',
              padding: 'var(--ds-space-2) var(--ds-space-3)',
              resize: 'none',
              outline: 'none',
              color: 'var(--ds-text-primary)',
              background: 'var(--ds-neutral-0)',
              lineHeight: 1.5,
              boxShadow: 'var(--ds-shadow-xs)',
            }}
          />
          <button
            aria-label="Send message"
            onClick={send}
            disabled={!input.trim() || loading}
            style={{
              flexShrink: 0,
              background: 'var(--ds-brand-600)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--ds-radius-md)',
              padding: 'var(--ds-space-2) var(--ds-space-4)',
              fontFamily: 'var(--ds-font-sans)',
              fontSize: 'var(--ds-text-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              opacity: (!input.trim() || loading) ? 0.5 : 1,
              transition: 'opacity 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            Send
          </button>
        </div>
      </div>

      <style>{`
        @keyframes chatDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .chat-bubble-user { border-radius: 18px 18px 2px 18px !important; }
        .chat-bubble-assistant { border-radius: 18px 18px 18px 2px !important; }
      `}</style>
    </>
  )
}
