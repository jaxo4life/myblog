import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Terminal, Heart, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <>
      <SiteHeader />

      <main className="min-h-screen py-12 bg-muted/30 pb-20 md:pb-12 relative">
        {/* 背景装饰 */}
        <div className="decorative-blob bg-terminal-green/5 w-64 h-64 -top-32 -right-32" />
        <div className="decorative-blob bg-cream-gold/5 w-48 h-48 bottom-20 -left-24" />
        <div className="absolute inset-0 bg-grid opacity-20" />

        <div className="mx-auto max-w-3xl px-6 lg:px-8 relative">
          {/* 页面标题 */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4 font-mono text-sm text-muted-foreground">
              <Terminal className="h-4 w-4 text-terminal-green" />
              <span>$ cat about.md</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              <span className="text-gradient">关于我</span>
            </h1>
            <p className="text-muted-foreground">
              一名热爱技术与分享的开发者
            </p>
          </div>

          {/* 终端风格介绍框 */}
          <div className="terminal-window mb-8 overflow-hidden">
            <div className="terminal-header">
              <div className="terminal-dot bg-red-400" />
              <div className="terminal-dot bg-yellow-400" />
              <div className="terminal-dot bg-terminal-green" />
              <span className="ml-4 text-xs text-muted-foreground font-mono">
                profile.json
              </span>
            </div>
            <div className="terminal-body">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded bg-terminal-green/10 border border-terminal-green/30 text-terminal-green font-mono font-bold shrink-0">
                  &gt;_
                </div>
                <div className="flex-1 min-w-0 overflow-x-auto -mx-2 px-2">
                  <pre className="text-sm sm:text-xs font-mono text-muted-foreground">
{`{
  "name": "MyBlog",
  "role": ["开发者", "创作者", "终身学习者"],
  "location": "中国",
  "status": "正在编码中...",
  "interests": ["前端开发", "Web3", "开源", "写作"]
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-slate max-w-none dark:prose-invert">
            <p className="text-lg text-muted-foreground">
              你好！我是一名开发者，热爱技术、喜欢分享。
              这个博客是我记录学习心得、分享技术见解的地方。
            </p>

            <h2>技术栈</h2>
            <p>
              我的主要技术栈包括：
            </p>
            <div className="terminal-window">
              <div className="terminal-body">
                <ul className="space-y-2 text-sm font-mono">
                  <li><span className="text-cream-gold">frontend:</span> [React, Next.js, TypeScript, Tailwind]</li>
                  <li><span className="text-cream-gold">backend:</span> [Node.js, PostgreSQL]</li>
                  <li><span className="text-cream-gold">tools:</span> [Docker, Git, CI/CD]</li>
                </ul>
              </div>
            </div>

            <h2>这个博客</h2>
            <p>
              这个博客是一个纯静态站点，使用以下技术构建：
            </p>
            <div className="terminal-window">
              <div className="terminal-body">
                <ul className="space-y-1 text-sm font-mono">
                  <li><a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="text-terminal-green hover:underline">Next.js 15</a> - React 框架</li>
                  <li><a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer" className="text-cream-gold hover:underline">Tailwind CSS</a> - CSS 框架</li>
                  <li><a href="https://mdxjs.com" target="_blank" rel="noopener noreferrer" className="text-terminal-green hover:underline">MDX</a> - 内容格式</li>
                  <li><a href="https://content-collections.dev" target="_blank" rel="noopener noreferrer" className="text-cream-gold hover:underline">Content Collections</a> - 内容管理</li>
                  <li><a href="https://pages.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-terminal-green hover:underline">Cloudflare Pages</a> - 静态托管</li>
                </ul>
              </div>
            </div>

            <h2>联系方式</h2>
            <p>
              欢迎通过以下方式与我联系：
            </p>
            <div className="flex flex-wrap gap-4 not-prose">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-terminal-outline font-mono"
              >
                &lt;GitHub /&gt;
              </a>
              <a
                href="mailto:hello@example.com"
                className="btn-terminal-outline font-mono"
              >
                &lt;Email /&gt;
              </a>
            </div>

            <h2>项目开源</h2>
            <p>
              这个博客的源代码是开源的，你可以在 <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-terminal-green hover:underline">GitHub</a> 上找到。
              欢迎 Star、Fork 或提出 Issue！
            </p>

            {/* 终端风格状态 */}
            <div className="mt-8 p-4 rounded-lg bg-secondary/50 border border-border">
              <div className="text-xs font-mono text-muted-foreground">
                <span className="text-terminal-green">$</span> neofetch --source about
              </div>
              <div className="mt-2 text-xs font-mono text-muted-foreground">
                <span className="text-cream-glow">OS:</span> Arch Linux<br />
                <span className="text-terminal-green">Shell:</span> zsh<br />
                <span className="text-cream-gold">Theme:</span> Retro Terminal
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  )
}
