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

interface ChatWidgetProps {
  clientId: string
  slug: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export function ChatWidget({ clientId, slug }: ChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        aria-label={open ? 'Close service finder chat' : 'Open service finder chat'}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        style={{
          position: 'fixed',
          bottom: 'var(--ds-space-6)',
          right: 'var(--ds-space-6)',
          zIndex: 200,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--ds-action-primary-bg, #1E4D8C)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          transition: 'transform 0.15s',
        }}
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Slide-up panel */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Find services chat"
          ref={panelRef}
          style={{
            position: 'fixed',
            bottom: 'calc(var(--ds-space-6) + 64px)',
            right: 'var(--ds-space-6)',
            zIndex: 199,
            width: 'min(380px, calc(100vw - 2 * var(--ds-space-4)))',
            maxHeight: '70vh',
            background: 'var(--ds-bg-surface, #fff)',
            border: '1px solid var(--ds-border-subtle)',
            borderRadius: 'var(--ds-radius-lg)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: 'var(--ds-space-3) var(--ds-space-4)',
            background: 'var(--ds-action-primary-bg, #1E4D8C)',
            color: '#fff',
            fontFamily: 'var(--ds-font-sans)',
            fontSize: 'var(--ds-text-sm)',
            fontWeight: 600,
          }}>
            Find Services
          </div>

          {/* Message thread */}
          <div
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 'var(--ds-space-3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-space-2)',
            }}
          >
            {/* Opening assistant bubble */}
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div className="chat-bubble-assistant" style={{
                maxWidth: '85%',
                padding: 'var(--ds-space-2) var(--ds-space-3)',
                background: '#e5e5ea',
                color: 'var(--ds-text-primary, #111)',
                fontFamily: 'var(--ds-font-sans)',
                fontSize: 'var(--ds-text-sm)',
                lineHeight: 1.5,
              }}>
                Hi! What can I help you find today?
              </div>
            </div>

            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-1)', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'} style={{
                  maxWidth: '85%',
                  padding: 'var(--ds-space-2) var(--ds-space-3)',
                  background: msg.role === 'user' ? 'var(--ds-action-primary-bg, #1E4D8C)' : '#e5e5ea',
                  color: msg.role === 'user' ? '#fff' : 'var(--ds-text-primary, #111)',
                  fontFamily: 'var(--ds-font-sans)',
                  fontSize: 'var(--ds-text-sm)',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>

                {/* Provider cards + filter nudge */}
                {msg.providers && msg.providers.length > 0 && (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-2)', marginTop: 'var(--ds-space-1)', alignItems: 'flex-start' }}>
                    {msg.providers.map(p => (
                      <div key={p.id} style={{
                        background: 'var(--ds-bg-surface, #fff)',
                        border: '1px solid var(--ds-border-subtle)',
                        borderRadius: 'var(--ds-radius-md)',
                        padding: 'var(--ds-space-3)',
                      }}>
                        <a
                          href={`/provider/${p.id}?slug=${slug}`}
                          style={{ margin: 0, fontFamily: 'var(--ds-font-sans)', fontSize: 'var(--ds-text-sm)', fontWeight: 600, color: 'var(--ds-action-primary-bg, #1E4D8C)', textDecoration: 'none' }}
                        >
                          {p.name}
                        </a>
                        {p.address && (
                          <p style={{ margin: '2px 0 0', fontFamily: 'var(--ds-font-sans)', fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)' }}>
                            {p.address}{p.distance_miles != null ? ` · ${p.distance_miles.toFixed(1)} mi` : ''}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: 'var(--ds-space-2)', marginTop: 'var(--ds-space-1)', flexWrap: 'wrap' }}>
                          {p.phone && (
                            <a href={`tel:${p.phone}`} style={{ fontFamily: 'var(--ds-font-sans)', fontSize: 'var(--ds-text-xs)', color: 'var(--ds-action-primary-bg, #1E4D8C)' }}>
                              {p.phone}
                            </a>
                          )}
                          {p.website && (
                            <a href={p.website} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--ds-font-sans)', fontSize: 'var(--ds-text-xs)', color: 'var(--ds-action-primary-bg, #1E4D8C)' }}>
                              Website
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="chat-bubble-assistant" style={{
                      padding: 'var(--ds-space-2) var(--ds-space-3)',
                      background: '#e5e5ea',
                      color: 'var(--ds-text-primary, #111)',
                      fontFamily: 'var(--ds-font-sans)',
                      fontSize: 'var(--ds-text-xs)',
                      lineHeight: 1.5,
                    }}>
                      {FILTER_NUDGE[msg.detectedLanguage ?? 'en'] ?? FILTER_NUDGE.en}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 4, padding: 'var(--ds-space-2)', alignItems: 'center' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ds-text-muted)', animation: 'chatDot 1.2s infinite', animationDelay: '0s', display: 'inline-block' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ds-text-muted)', animation: 'chatDot 1.2s infinite', animationDelay: '0.2s', display: 'inline-block' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ds-text-muted)', animation: 'chatDot 1.2s infinite', animationDelay: '0.4s', display: 'inline-block' }} />
              </div>
            )}

            {error && (
              <p style={{ margin: 0, fontFamily: 'var(--ds-font-sans)', fontSize: 'var(--ds-text-xs)', color: 'var(--ds-error, #dc2626)', textAlign: 'center' }}>
                {error}
              </p>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div style={{
            borderTop: '1px solid var(--ds-border-subtle)',
            padding: 'var(--ds-space-2) var(--ds-space-3)',
            display: 'flex',
            gap: 'var(--ds-space-2)',
            alignItems: 'flex-end',
          }}>
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
                border: '1px solid var(--ds-border-subtle)',
                borderRadius: 'var(--ds-radius-md)',
                padding: 'var(--ds-space-2)',
                resize: 'none',
                outline: 'none',
                color: 'var(--ds-text-primary)',
                background: 'var(--ds-bg-surface, #fff)',
                lineHeight: 1.5,
              }}
            />
            <button
              aria-label="Send message"
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                background: 'var(--ds-action-primary-bg, #1E4D8C)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--ds-radius-md)',
                padding: 'var(--ds-space-2) var(--ds-space-3)',
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
      )}

      <style>{`
        @keyframes chatDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .chat-bubble-user {
          border-radius: 18px 18px 2px 18px !important;
        }
        .chat-bubble-assistant {
          border-radius: 18px 18px 18px 2px !important;
        }
      `}</style>
    </>
  )
}
