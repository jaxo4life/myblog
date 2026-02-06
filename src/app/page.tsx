import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { PostGrid } from '@/components/blog/post-grid'
import { getPublishedPosts, getFeaturedPosts } from '@/lib/content'
import { getAllTags } from '@/lib/content'
import Link from 'next/link'
import { ArrowRight, BookOpen, Calendar, Terminal, FolderOpen } from 'lucide-react'

export default function HomePage() {
  const posts = getPublishedPosts()
  const featuredPosts = getFeaturedPosts()
  const tags = getAllTags().slice(0, 8)

  return (
    <>
      <SiteHeader />

      <main className="pb-16 md:pb-0">
        {/* Hero 区域 - 终端风格 */}
        <section className="relative border-b border-border bg-muted/30 overflow-hidden">
          {/* 扫描线效果 */}
          <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />

          {/* 装饰性光晕 */}
          <div className="decorative-blob bg-terminal-green/10 w-96 h-96 -top-48 -left-48" />
          <div className="decorative-blob bg-cream-gold/10 w-64 h-64 top-20 right-20" />
          <div className="decorative-blob bg-terminal-green/5 w-48 h-48 bottom-0 right-1/3" />

          {/* 背景网格 */}
          <div className="absolute inset-0 bg-grid-radial opacity-40" />

          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 relative">
            <div className="mx-auto max-w-4xl">
              {/* 终端窗口 */}
              <div className="terminal-window terminal-glow animate-fade-in">
                <div className="terminal-header">
                  <div className="terminal-dot bg-red-400" />
                  <div className="terminal-dot bg-yellow-400" />
                  <div className="terminal-dot bg-terminal-green" />
                  <span className="ml-4 text-xs text-muted-foreground font-mono">
                    guest@blog:~/welcome
                  </span>
                </div>
                <div className="terminal-body">
                  {/* 终端命令 */}
                  <div className="font-mono text-sm mb-6 text-muted-foreground">
                    <span className="text-terminal-green">$</span> ./hero.sh --welcome
                  </div>

                  {/* 主标题 */}
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Terminal className="h-8 w-8 md:h-10 md:w-10 text-terminal-green" />
                      <span className="text-gradient">~/数字花园</span>
                    </div>
                    <p className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground font-normal mt-4">
                      探索技术与思考的
                      <span className="text-gradient"> 空间</span>
                      <span className="cursor-blink">_</span>
                    </p>
                  </h1>

                  {/* 描述 */}
                  <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl">
                    一个专注于技术分享与思考记录的空间。探索前端开发、软件工程，
                    以及成长路上的点点滴滴。
                  </p>

                  {/* 统计数据 - 终端输出风格 */}
                  <div className="mt-8 font-mono text-sm bg-secondary/50 rounded-lg p-4 inline-block overflow-x-auto max-w-full">
                    <div className="flex items-center gap-4 md:gap-6 flex-wrap">
                      <div className="flex items-center gap-2 shrink-0">
                        <BookOpen className="h-5 w-5 text-terminal-green" />
                        <span className="text-muted-foreground">posts:</span>
                        <span className="text-terminal-green">{posts.length}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <FolderOpen className="h-5 w-5 text-cream-gold" />
                        <span className="text-muted-foreground">tags:</span>
                        <span className="text-cream-gold">{tags.length}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Calendar className="h-5 w-5 text-terminal-green" />
                        <span className="text-muted-foreground">uptime:</span>
                        <span className="text-foreground">since 2023</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA 按钮 */}
                  <div className="mt-10 flex flex-wrap items-center gap-4">
                    <Link
                      href="/blog"
                      className="btn-terminal group"
                    >
                      <Terminal className="h-4 w-4" />
                      浏览文章
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/tags"
                      className="btn-terminal-outline"
                    >
                      探索标签
                    </Link>
                  </div>
                </div>
              </div>

              {/* 装饰性终端命令片段 */}
              <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs font-mono text-muted-foreground/60">
                <span className="opacity-0 animate-pulse">git commit</span>
                <span className="opacity-0 animate-pulse" style={{ animationDelay: '0.5s' }}>npm run build</span>
                <span className="opacity-0 animate-pulse" style={{ animationDelay: '1s' }}>vim life.md</span>
                <span className="opacity-0 animate-pulse" style={{ animationDelay: '1.5s' }}>ctrl+c ctrl+v</span>
              </div>
            </div>
          </div>

          {/* 底部渐变装饰 */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* 特色文章 */}
        {featuredPosts.length > 0 && (
          <section className="py-16 bg-background relative">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal className="h-5 w-5 text-terminal-green" />
                    <span className="text-xs font-mono text-muted-foreground">$ cat featured.md</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    特色文章
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    精选内容，值得一读
                  </p>
                </div>
                <Link
                  href="/blog"
                  className="text-sm text-terminal-green hover:underline flex items-center gap-1 font-mono"
                >
                  ./all_posts <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <PostGrid posts={featuredPosts.slice(0, 3)} />
            </div>
          </section>
        )}

        {/* 最新文章 */}
        <section className="py-16 bg-muted/30 relative overflow-hidden">
          {/* 背景网格 */}
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Terminal className="h-5 w-5 text-terminal-green" />
                  <span className="text-xs font-mono text-muted-foreground">$ ls -la posts/ | head -6</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  最新文章
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  最近发布的 {Math.min(6, posts.length)} 篇文章
                </p>
              </div>
              <Link
                href="/blog"
                className="text-sm text-terminal-green hover:underline flex items-center gap-1 font-mono"
              >
                ./all_posts <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <PostGrid posts={posts.slice(0, 6)} />
          </div>
        </section>

        {/* 热门标签 */}
        {tags.length > 0 && (
          <section className="py-20 bg-background relative">
            {/* 装饰性光晕 */}
            <div className="decorative-blob bg-terminal-green/5 w-64 h-64 -bottom-32 -left-32" />
            <div className="decorative-blob bg-cream-gold/10 w-48 h-48 top-10 right-10" />

            <div className="mx-auto max-w-4xl px-6 lg:px-8 relative">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Terminal className="h-5 w-5 text-terminal-green" />
                  <span className="text-xs font-mono text-muted-foreground">$ ls tags/</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  探索热门标签
                </h2>
                <p className="text-muted-foreground">
                  按主题浏览，发现你感兴趣的内容
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog/tag/${tag.toLowerCase()}`}
                    className="group"
                  >
                    <span className="tag-array hover:border-terminal-green/50 transition-colors">
                      <span className="group-hover:text-terminal-green transition-colors">{tag}</span>
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link
                  href="/tags"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-terminal-green transition-colors font-mono"
                >
                  $ ./all_tags
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  )
}
