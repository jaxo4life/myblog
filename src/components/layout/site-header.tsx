'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Terminal, Github, Rss } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      <div className="border-b border-border/50 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-8 items-center gap-2 text-xs font-mono text-muted-foreground">
            <Terminal className="h-3 w-3 text-terminal-green" />
            <span>~/blog</span>
            <span className="text-terminal-green/50">:</span>
            <span className="text-foreground">{pathname === '/' ? '~' : pathname.replace('/blog/', '').replace('/tags', 'tags')}</span>
            <span className="ml-auto flex items-center gap-3">
              <a href="/rss.xml" className="hover:text-terminal-green transition-colors">
                <Rss className="h-3 w-3" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-terminal-green transition-colors">
                <Github className="h-3 w-3" />
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
                    'relative px-4 py-2 text-sm font-medium transition-all',
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/95 backdrop-blur z-50">
        <div className="flex items-center justify-around h-14">
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
