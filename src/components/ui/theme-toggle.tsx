'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

type ThemeToggleProps = {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex h-8 w-8 items-center justify-center rounded-md',
        'bg-secondary border border-border',
        'hover:border-terminal-green/50 hover:bg-terminal-green/5',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-terminal-green focus:ring-offset-2',
        className
      )}
      aria-label={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
    >
      <Sun className="h-4 w-4 text-cream-gold rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 text-terminal-green rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">切换主题</span>
    </button>
  )
}
