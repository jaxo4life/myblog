import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        secondary: 'hsl(var(--secondary))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent: 'hsl(var(--accent))',
        border: 'hsl(var(--border))',
        'card-background': 'hsl(var(--card-background))',
        'card-foreground': 'hsl(var(--card-foreground))',
        'terminal-green': 'hsl(var(--terminal-green))',
        'cream-gold': 'hsl(var(--cream-gold))',
        'cream-glow': 'hsl(60 80% 65%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      typography: ({ theme }: any) => ({
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'hsl(var(--foreground))',
            lineHeight: '1.75',
            fontSize: '1.125rem',
            '--tw-prose-body': 'hsl(var(--foreground))',
            '--tw-prose-headings': 'hsl(var(--foreground))',
            '--tw-prose-links': 'hsl(var(--primary))',
            '--tw-prose-bold': 'hsl(var(--foreground))',
            '--tw-prose-counters': 'hsl(var(--muted-foreground))',
            '--tw-prose-bullets': 'hsl(var(--muted-foreground))',
            '--tw-prose-hr': 'hsl(var(--border))',
            '--tw-prose-quotes': 'hsl(var(--foreground))',
            '--tw-prose-quote-borders': 'hsl(var(--border))',
            '--tw-prose-code': 'hsl(var(--primary))',
            '--tw-prose-pre-code': 'hsl(var(--background))',
            '--tw-prose-pre-bg': 'hsl(var(--muted))',
            '--tw-prose-th-borders': 'hsl(var(--border))',
            '--tw-prose-td-borders': 'hsl(var(--border))',
            h1: {
              fontSize: '2.25rem',
              fontWeight: '800',
              letterSpacing: '-0.025em',
              marginTop: '0',
              marginBottom: '0.875rem',
              lineHeight: '1.2',
            },
            h2: {
              fontSize: '1.75rem',
              fontWeight: '700',
              marginTop: '2.5rem',
              marginBottom: '1rem',
              lineHeight: '1.3',
            },
            h3: {
              fontSize: '1.375rem',
              fontWeight: '600',
              marginTop: '2rem',
              marginBottom: '0.75rem',
            },
            h4: {
              fontSize: '1.125rem',
              fontWeight: '600',
              marginTop: '1.75rem',
            },
            'h2,h3,h4': {
              scrollMarginTop: '5rem',
            },
            p: {
              marginTop: '1.25rem',
              marginBottom: '1.25rem',
            },
            code: {
              fontSize: '0.875em',
              fontWeight: '500',
              backgroundColor: 'hsl(var(--muted))',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: 'hsl(var(--muted))',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
              overflowX: 'auto',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
              fontSize: '0.875rem',
            },
            a: {
              textDecoration: 'underline',
              textDecorationColor: 'hsl(var(--primary) / 0.3)',
              underlineOffset: '2px',
              fontWeight: '500',
            },
            'a:hover': {
              textDecorationColor: 'hsl(var(--primary))',
            },
            strong: {
              fontWeight: '700',
            },
            blockquote: {
              borderLeftWidth: '3px',
              borderLeftColor: 'hsl(var(--primary))',
              paddingLeft: '1rem',
              fontStyle: 'italic',
              color: 'hsl(var(--muted-foreground))',
            },
            ul: {
              paddingLeft: '1.25rem',
              listStyleType: 'disc',
            },
            ol: {
              paddingLeft: '1.25rem',
              listStyleType: 'decimal',
            },
            li: {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },
            'li > ul': {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },
            table: {
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
            },
            thead: {
              borderBottomWidth: '1px',
              borderBottomColor: 'hsl(var(--border))',
            },
            th: {
              fontWeight: '600',
              textAlign: 'left',
              padding: '0.5rem 1rem',
            },
            td: {
              padding: '0.5rem 1rem',
              borderBottomWidth: '1px',
              borderBottomColor: 'hsl(var(--border))',
            },
            img: {
              marginTop: '2rem',
              marginBottom: '2rem',
              borderRadius: '0.5rem',
            },
            hr: {
              marginTop: '3rem',
              marginBottom: '3rem',
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
}

export default config
