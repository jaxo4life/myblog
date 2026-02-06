import Link from 'next/link'
import { Terminal } from 'lucide-react'

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

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const navigation = {
  导航: [
    { name: '博客', href: '/blog' },
    { name: '标签', href: '/tags' },
    { name: '关于', href: '/about' },
  ],
  资源: [
    { name: 'RSS', href: '/rss.xml' },
    { name: 'Sitemap', href: '/sitemap.xml' },
  ],
  社交: [
    { name: 'GitHub', href: 'https://github.com/jaxo4life', icon: GithubIcon },
    { name: 'X', href: 'https://x.com/realjaxo', icon: XIcon },
  ],
}

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-muted/30" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        页脚
      </h2>

      {/* 终端风格状态栏 */}
      <div className="border-b border-border/50 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-2">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-2">
              <Terminal className="h-3 w-3 text-terminal-green" />
              <span>~/blog</span>
              <span className="text-terminal-green/50">:</span>
              <span>footer.sh</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="text-cream-gold">NORMAL</span>
              <span className="text-terminal-green">git:{currentYear}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          {/* Logo 区域 */}
          <div className="col-span-2">
            <Link href="/" className="text-lg font-bold tracking-tight font-mono">
              <span className="text-gradient">blog</span>
              <span className="text-muted-foreground">@me</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              分享技术、思考和生活的个人博客。用文字记录成长，用代码构建世界。
            </p>
          </div>

          {/* 导航链接 */}
          {Object.entries(navigation).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold leading-6 text-foreground mb-4 font-mono">
                {/* // */} {category}
              </h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-terminal-green transition-colors flex items-center gap-2"
                    >
                      {'icon' in item && <item.icon className="h-4 w-4" />}
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 底部信息 */}
        <div className="mt-8 border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground font-mono">
            <span className="text-terminal-green">$</span> echo &quot;© {currentYear}. All rights reserved.&quot;
          </p>
          <p className="text-sm text-muted-foreground font-mono">
            <span className="text-terminal-green">built_with</span> [
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-terminal-green hover:underline"
            >
              Next.js
            </a>
            {' + '}
            <a
              href="https://tailwindcss.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream-gold hover:underline"
            >
              Tailwind
            </a>
            ]
          </p>
        </div>
      </div>
    </footer>
  )
}
