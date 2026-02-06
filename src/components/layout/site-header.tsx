'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Terminal, Rss } from 'lucide-react'
import { cn } from '@/lib/utils'

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

const navigation = [
  { name: '首页', href: '/' },
  { name: '博客', href: '/blog' },
  { name: '标签', href: '/tags' },
  { name: '关于', href: '/about' },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 glass">
      {/* 终端路径栏 */}
      <div className="border-b border-border/50 bg-secondary/30 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-8 items-center gap-2 text-xs font-mono text-muted-foreground min-w-0">
            <Terminal className="h-3 w-3 text-terminal-green flex-shrink-0" />
            <span className="truncate">~/blog</span>
            <span className="text-terminal-green/50 flex-shrink-0">:</span>
            <span className="text-foreground truncate">{pathname === '/' ? '~' : pathname.replace('/blog/', '').replace('/tags', 'tags')}</span>
            <span className="ml-auto flex items-center gap-3 flex-shrink-0">
              <a href="/rss.xml" target="_blank" rel="noopener noreferrer" className="hover:text-terminal-green transition-colors">
                <Rss className="h-3 w-3" />
              </a>
              <a href="https://github.com/jaxo4life/myblog" target="_blank" rel="noopener noreferrer" className="hover:text-terminal-green transition-colors">
                <GithubIcon className="h-3 w-3" />
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* 主导航 */}
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo - 终端风格 */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-terminal-green/10 border border-terminal-green/30 text-terminal-green font-mono font-bold group-hover:bg-terminal-green/20 transition-colors">
              &gt;_
            </div>
            <span className="text-lg font-bold font-mono">
              <span className="text-gradient">blog</span>
              <span className="text-muted-foreground">@me</span>
            </span>
          </Link>

          {/* 桌面端 Tab 导航 */}
          <nav className="hidden md:flex items-center gap-1" aria-label="主导航">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'relative px-16 py-2 text-sm font-medium transition-all',
                    'font-mono rounded-md',
                    'border border-transparent hover:border-terminal-green/30',
                    isActive ? 'text-terminal-green bg-terminal-green/5 border-terminal-green/20' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {isActive && <span className="text-terminal-green">$</span>}
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* 右侧操作区 */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* 移动端底部导航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/95 backdrop-blur z-50 overflow-hidden">
        <div className="flex items-center justify-around h-14 w-full">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full',
                  'text-xs font-medium transition-colors font-mono',
                  isActive ? 'text-terminal-green' : 'text-muted-foreground'
                )}
              >
                <span className="text-xs">{isActive ? '$' : '>'}</span>
                {item.name}
              </Link>
            )
          })}
          {/* 移动端主题切换按钮 */}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
