'use client'

import { useState } from 'react'
import { submitContact } from '@/lib/api'

const FALLBACK_LANGUAGES = [
  'English', 'Spanish', 'Portuguese', 'Haitian Creole', 'French',
  'Mandarin', 'Cantonese', 'Vietnamese', 'Arabic', 'Somali',
  'Russian', 'Korean', 'Cape Verdean Creole', 'Khmer', 'Hindi', 'Gujarati', 'ASL',
]

type ContactPreference = 'email' | 'phone' | 'text'

interface ContactFormProps {
  providerId: string
  providerName: string
  providerEmail: string | null
  languageTags?: string[]
}

interface FormState {
  name: string
  email: string
  phone: string
  message: string
  preference: ContactPreference
  language: string
}

const EMPTY: FormState = { name: '', email: '', phone: '', message: '', preference: 'email', language: 'English' }

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '36px',
  padding: '0 12px',
  fontSize: 'var(--ds-text-sm)',
  fontFamily: 'var(--ds-font-sans)',
  color: 'var(--ds-text-primary)',
  backgroundColor: 'var(--ds-bg-default)',
  border: '1px solid var(--ds-border-strong)',
  borderRadius: 'var(--ds-radius-md)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  border: '1px solid var(--ds-error-base)',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 'var(--ds-text-xs)',
  fontWeight: 600,
  color: 'var(--ds-text-primary)',
  marginBottom: '4px',
  fontFamily: 'var(--ds-font-sans)',
}

const errorMsgStyle: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: 'var(--ds-text-xs)',
  color: 'var(--ds-error-base)',
  fontFamily: 'var(--ds-font-sans)',
}

export function ContactForm({ providerId, providerName, providerEmail, languageTags }: ContactFormProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const languages = languageTags && languageTags.length > 0
    ? [...languageTags, ...FALLBACK_LANGUAGES.filter(l => !languageTags.includes(l))]
    : FALLBACK_LANGUAGES

  function validate(): boolean {
    const next: typeof errors = {}
    if (!form.name.trim()) next.name = 'Your name is required.'
    if (!form.message.trim()) next.message = 'Please add a brief message.'

    if (form.preference === 'email') {
      if (!form.email.trim()) {
        next.email = 'Email is required for your preferred contact method.'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        next.email = 'Enter a valid email address.'
      }
    }
    if (form.preference === 'phone' || form.preference === 'text') {
      if (!form.phone.trim()) next.phone = 'Phone number is required for your preferred contact method.'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  function isSubmittable(): boolean {
    if (!form.name.trim() || !form.message.trim()) return false
    if (form.preference === 'email' && !form.email.trim()) return false
    if ((form.preference === 'phone' || form.preference === 'text') && !form.phone.trim()) return false
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await submitContact(providerId, {
        name: form.name,
        sender_email: form.email || undefined,
        sender_phone: form.phone || undefined,
        message: form.message,
        preference: form.preference,
        language: form.language,
      })
      setSubmitted(true)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleReset() {
    setForm(EMPTY); setErrors({}); setSubmitted(false); setSubmitError(null); setOpen(false)
  }

  return (
    <div style={{ position: 'relative', zIndex: 10 }}>
      <button
        type="button"
        onClick={() => {
          setOpen(v => !v)
          if (submitted) { setSubmitted(false); setForm(EMPTY); setErrors({}) }
        }}
        aria-expanded={open}
        aria-controls="contact-form-panel"
        style={{
          marginTop: 'var(--ds-space-3)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: 'var(--ds-radius-md)',
          border: `1px solid ${open ? 'var(--ds-brand-400)' : 'var(--ds-brand-300)'}`,
          backgroundColor: open ? 'var(--ds-brand-600)' : 'var(--ds-brand-50)',
          color: open ? 'white' : 'var(--ds-brand-700)',
          fontSize: 'var(--ds-text-sm)',
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'var(--ds-font-sans)',
          transition: 'all 0.15s',
          boxShadow: 'var(--ds-shadow-sm)',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M2 2a2 2 0 012-2h8a2 2 0 012 2v9.5a.5.5 0 01-.777.416L8 9.768l-5.223 2.148A.5.5 0 012 11.5V2z"/>
        </svg>
        {open ? 'Close' : 'Contact'}
      </button>

      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 0.22s ease' }}>
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          <div
            id="contact-form-panel"
            role="region"
            aria-label={`Contact form for ${providerName}`}
            style={{
              marginTop: 'var(--ds-space-3)',
              borderRadius: 'var(--ds-radius-lg)',
              border: '1px solid var(--ds-border-default)',
              backgroundColor: 'var(--ds-bg-subtle)',
              padding: 'var(--ds-space-4)',
            }}
          >
            {/* No email on file */}
            {!providerEmail ? (
              <p style={{ margin: 0, fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-secondary)', fontFamily: 'var(--ds-font-sans)' }}>
                Online contact is not available for this provider. Please call or visit directly.
              </p>
            ) : submitted ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--ds-space-3)', textAlign: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--ds-success-light)', color: 'var(--ds-success-base)' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"/>
                  </svg>
                </span>
                <p style={{ fontSize: 'var(--ds-text-sm)', fontWeight: 600, color: 'var(--ds-text-primary)', fontFamily: 'var(--ds-font-sans)', margin: 0 }}>Message sent</p>
                <p style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-tertiary)', fontFamily: 'var(--ds-font-sans)', margin: 0 }}>
                  {providerName} will be in touch via your preferred contact method.
                </p>
                <button type="button" onClick={handleReset} style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-brand-600)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--ds-font-sans)', padding: 0 }}>
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-4)' }}>
                <p style={{ margin: 0, fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-tertiary)', fontFamily: 'var(--ds-font-sans)' }}>
                  Send a message to <span style={{ color: 'var(--ds-text-primary)', fontWeight: 600 }}>{providerName}</span>
                </p>

                {/* Name */}
                <div>
                  <label htmlFor="cf-name" style={labelStyle}>Your name</label>
                  <input
                    id="cf-name" type="text" autoComplete="name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    onBlur={() => { if (!form.name.trim()) setErrors(e => ({ ...e, name: 'Your name is required.' })) }}
                    aria-describedby={errors.name ? 'cf-name-error' : undefined}
                    aria-invalid={!!errors.name}
                    placeholder="Jane Smith"
                    style={errors.name ? inputErrorStyle : inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--ds-brand-400)')}
                  />
                  {errors.name && <p id="cf-name-error" role="alert" style={errorMsgStyle}>{errors.name}</p>}
                </div>

                {/* Contact preference */}
                <fieldset style={{ margin: 0, padding: 0, border: 'none' }}>
                  <legend style={{ ...labelStyle, marginBottom: '8px' }}>Preferred way to be contacted back</legend>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-space-2)' }}>
                    {(['email', 'phone', 'text'] as ContactPreference[]).map(pref => {
                      const active = form.preference === pref
                      return (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => { setForm(f => ({ ...f, preference: pref })); setErrors(e => ({ ...e, email: undefined, phone: undefined })) }}
                          aria-pressed={active}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '6px 14px',
                            borderRadius: 'var(--ds-radius-md)',
                            border: `1px solid ${active ? 'var(--ds-brand-400)' : 'var(--ds-border-strong)'}`,
                            backgroundColor: active ? 'var(--ds-brand-50)' : 'var(--ds-bg-default)',
                            color: active ? 'var(--ds-brand-700)' : 'var(--ds-neutral-600)',
                            fontSize: 'var(--ds-text-sm)', fontWeight: active ? 600 : 400,
                            cursor: 'pointer', fontFamily: 'var(--ds-font-sans)', transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0, border: `2px solid ${active ? 'var(--ds-brand-600)' : 'var(--ds-border-strong)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {active && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--ds-brand-600)' }} />}
                          </div>
                          <span style={{ textTransform: 'capitalize' }}>{pref}</span>
                        </button>
                      )
                    })}
                  </div>
                </fieldset>

                {/* Email — required when preference is email */}
                <div>
                  <label htmlFor="cf-email" style={labelStyle}>
                    Your email {form.preference === 'email'
                      ? <span style={{ color: 'var(--ds-error-base)' }}>*</span>
                      : <span style={{ fontWeight: 400, color: 'var(--ds-text-tertiary)' }}>(optional)</span>}
                  </label>
                  <input
                    id="cf-email" type="email" autoComplete="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    onBlur={() => {
                      if (form.preference === 'email' && !form.email.trim()) setErrors(e => ({ ...e, email: 'Email is required for your preferred contact method.' }))
                    }}
                    aria-describedby={errors.email ? 'cf-email-error' : undefined}
                    aria-invalid={!!errors.email}
                    placeholder="you@example.com"
                    style={errors.email ? inputErrorStyle : inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--ds-brand-400)')}
                  />
                  {errors.email && <p id="cf-email-error" role="alert" style={errorMsgStyle}>{errors.email}</p>}
                </div>

                {/* Phone — required when preference is phone or text */}
                <div>
                  <label htmlFor="cf-phone" style={labelStyle}>
                    Your phone {(form.preference === 'phone' || form.preference === 'text')
                      ? <span style={{ color: 'var(--ds-error-base)' }}>*</span>
                      : <span style={{ fontWeight: 400, color: 'var(--ds-text-tertiary)' }}>(optional)</span>}
                  </label>
                  <input
                    id="cf-phone" type="tel" autoComplete="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    onBlur={() => {
                      if ((form.preference === 'phone' || form.preference === 'text') && !form.phone.trim())
                        setErrors(e => ({ ...e, phone: 'Phone number is required for your preferred contact method.' }))
                    }}
                    aria-describedby={errors.phone ? 'cf-phone-error' : undefined}
                    aria-invalid={!!errors.phone}
                    placeholder="+1 617-555-0100"
                    style={errors.phone ? inputErrorStyle : inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--ds-brand-400)')}
                  />
                  {errors.phone && <p id="cf-phone-error" role="alert" style={errorMsgStyle}>{errors.phone}</p>}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="cf-message" style={labelStyle}>Message <span style={{ color: 'var(--ds-error-base)' }}>*</span></label>
                  <textarea
                    id="cf-message" rows={3}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    onBlur={() => { if (!form.message.trim()) setErrors(e => ({ ...e, message: 'Please add a brief message.' })) }}
                    aria-describedby={errors.message ? 'cf-message-error' : undefined}
                    aria-invalid={!!errors.message}
                    placeholder="Briefly describe what you need help with…"
                    style={{
                      display: 'block', width: '100%', padding: '8px 12px',
                      fontSize: 'var(--ds-text-sm)', fontFamily: 'var(--ds-font-sans)',
                      color: 'var(--ds-text-primary)', backgroundColor: 'var(--ds-bg-default)',
                      border: `1px solid ${errors.message ? 'var(--ds-error-base)' : 'var(--ds-border-strong)'}`,
                      borderRadius: 'var(--ds-radius-md)', outline: 'none',
                      resize: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--ds-brand-400)')}
                  />
                  {errors.message && <p id="cf-message-error" role="alert" style={errorMsgStyle}>{errors.message}</p>}
                </div>

                {/* Language */}
                <div>
                  <label htmlFor="cf-language" style={labelStyle}>Language you'd like to be served in</label>
                  <select
                    id="cf-language"
                    value={form.language}
                    onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                    style={{
                      display: 'block', width: '100%', height: '36px', padding: '0 12px',
                      fontSize: 'var(--ds-text-sm)', fontFamily: 'var(--ds-font-sans)',
                      color: 'var(--ds-text-primary)', backgroundColor: 'var(--ds-bg-default)',
                      border: '1px solid var(--ds-border-strong)',
                      borderRadius: 'var(--ds-radius-md)', outline: 'none', cursor: 'pointer', boxSizing: 'border-box',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--ds-brand-400)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--ds-border-strong)')}
                  >
                    {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                  </select>
                </div>

                {submitError && (
                  <p role="alert" style={{ margin: 0, fontSize: 'var(--ds-text-xs)', color: 'var(--ds-error-base)', fontFamily: 'var(--ds-font-sans)' }}>
                    {submitError}
                  </p>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-space-3)', paddingTop: 'var(--ds-space-1)' }}>
                  <button
                    type="submit"
                    disabled={!isSubmittable() || submitting}
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      padding: '8px 20px',
                      borderRadius: 'var(--ds-radius-md)',
                      border: 'none',
                      backgroundColor: isSubmittable() && !submitting ? 'var(--ds-brand-600)' : 'var(--ds-neutral-300)',
                      color: isSubmittable() && !submitting ? 'white' : 'var(--ds-text-tertiary)',
                      fontSize: 'var(--ds-text-sm)', fontWeight: 600,
                      cursor: isSubmittable() && !submitting ? 'pointer' : 'not-allowed',
                      fontFamily: 'var(--ds-font-sans)',
                      transition: 'background-color 0.15s',
                    }}
                  >
                    {submitting ? 'Sending…' : 'Send message'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    style={{ fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--ds-font-sans)', padding: 0 }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
