import Link from 'next/link'
import { Github, Rss, Terminal } from 'lucide-react'

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
    { name: 'GitHub', href: '#', icon: Github },
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
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
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
