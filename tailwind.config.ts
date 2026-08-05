import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ── Colours ─────────────────────────────────────────────────────────────
      // All reference CSS variables injected by buildCssBlock().
      // A single Tailwind build works for every white-label tenant — no rebuild.
      //
      // The <alpha-value> placeholder enables opacity modifiers:
      //   bg-primary/10 → background-color: hsl(var(--color-primary) / 0.1)
      colors: {
        primary: {
          DEFAULT:    'hsl(var(--color-primary) / <alpha-value>)',
          foreground: 'hsl(var(--color-primary-foreground) / <alpha-value>)',
          hover:      'hsl(var(--color-primary-hover) / <alpha-value>)',
        },
        accent: {
          DEFAULT:    'hsl(var(--color-accent) / <alpha-value>)',
          foreground: 'hsl(var(--color-accent-foreground) / <alpha-value>)',
        },
        surface:         'hsl(var(--color-surface) / <alpha-value>)',
        background:      'hsl(var(--color-background) / <alpha-value>)',
        'on-surface':    'hsl(var(--color-on-surface) / <alpha-value>)',
        'on-background': 'hsl(var(--color-on-background) / <alpha-value>)',
        error: {
          DEFAULT:    'hsl(var(--color-error) / <alpha-value>)',
          foreground: 'hsl(var(--color-primary-foreground) / <alpha-value>)',
        },
        border:   'hsl(var(--color-border) / <alpha-value>)',
        disabled: 'hsl(var(--color-disabled) / <alpha-value>)',
        focus:    'hsl(var(--color-focus) / <alpha-value>)',

        // ── Backward-compat aliases (existing component classes keep working) ──
        foreground: 'hsl(var(--color-foreground) / <alpha-value>)',
        input:      'hsl(var(--color-input) / <alpha-value>)',
        ring:       'hsl(var(--color-ring) / <alpha-value>)',
        secondary: {
          DEFAULT:    'hsl(var(--color-secondary) / <alpha-value>)',
          foreground: 'hsl(var(--color-secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT:    'hsl(var(--color-muted) / <alpha-value>)',
          foreground: 'hsl(var(--color-muted-foreground) / <alpha-value>)',
        },
      },

      // ── Font families ────────────────────────────────────────────────────────
      fontFamily: {
        sans:    ['var(--font-sans)',        'system-ui', 'sans-serif'],
        heading: ['var(--font-family-h1)',   'system-ui', 'sans-serif'],
        body:    ['var(--font-family-body)', 'system-ui', 'sans-serif'],
      },

      // ── Corner radius ────────────────────────────────────────────────────────
      // Maps rounded-sm / rounded-md / rounded-lg / rounded-full to theme tokens.
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        full: 'var(--radius-full)',
      },

      // ── Container query breakpoints ──────────────────────────────────────────
      containers: {
        xs: '20rem',  // 320px
      },
    },
  },
  plugins: [require('@tailwindcss/container-queries')],
}

export default config
