import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { ReadingProgress } from '@/components/blog/reading-progress'
import { TableOfContents } from '@/components/blog/table-of-contents'
import { getPostBySlug, getPublishedPosts } from '@/lib/content'
import { formatDate } from '@/lib/utils'
import { Terminal, Calendar, Clock, ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { MDXContent } from '@content-collections/mdx/react'
import { cn } from '@/lib/utils'

interface PostPageProps {
  params: Promise<{ slug: string[] }>
}

export function generateStaticParams() {
  const posts = getPublishedPosts()
  return posts.map((post) => ({
    slug: post.slug.split('/'),
  }))
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params
  const slugStr = Array.isArray(slug) ? slug.join('/') : slug
  const post = getPostBySlug(slugStr)

  if (!post) return {}

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.date.toISOString(),
      tags: post.tags,
    },
  }
}

function PostContent({ code }: { code: string }) {
  return <MDXContent code={code} />
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const slugStr = Array.isArray(slug) ? slug.join('/') : slug
  const post = getPostBySlug(slugStr)

  if (!post) {
    notFound()
  }

  return (
    <>
      <ReadingProgress />
      <SiteHeader />

      <article className="min-h-screen pb-20 md:pb-0">
        {/* 文章头部 */}
        <header className="border-b border-border bg-muted/30 relative overflow-hidden">
          {/* 装饰性光晕 */}
          <div className="decorative-blob bg-terminal-green/5 w-64 h-64 -top-32 -right-32" />
          <div className="decorative-blob bg-cream-gold/5 w-48 h-48 bottom-0 left-20" />

          {/* 背景网格 */}
          <div className="absolute inset-0 bg-grid opacity-20" />

          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            <div className="mx-auto max-w-3xl">
              {/* 路径风格面包屑 */}
              <nav className="mb-6 text-sm font-mono text-muted-foreground">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href="/" className="hover:text-terminal-green transition-colors">
                    ~/
                  </Link>
                  <span className="text-terminal-green/50">/</span>
                  <Link href="/blog" className="hover:text-terminal-green transition-colors">
                    blog
                  </Link>
                  <span className="text-terminal-green/50">/</span>
                  <span className="text-foreground">{post.slug}</span>
                </div>
              </nav>

              {/* 元数据终端框 */}
              <div className="terminal-window mb-6">
                <div className="terminal-header">
                  <div className="terminal-dot bg-red-400" />
                  <div className="terminal-dot bg-yellow-400" />
                  <div className="terminal-dot bg-terminal-green" />
                  <span className="ml-4 text-xs text-muted-foreground font-mono">
                    post.json
                  </span>
                </div>
                <div className="terminal-body">
                  <pre className="text-xs font-mono text-muted-foreground">
{`{
  "title": "${post.title.substring(0, 30)}${post.title.length > 30 ? '...' : ''}",
  "author": "guest",
  "date": "${formatDate(post.date)}",
  "tags": [${post.tags.map(t => `"${t}"`).join(', ')}],
  "read": "~${post.readingTime}min"
}`}
</pre>
                </div>
              </div>

              {/* 标题 */}
              <h1 className="text-3xl font-bold tracking-tight text-gradient sm:text-4xl lg:text-5xl">
                {post.title}
              </h1>

              {/* 摘要 */}
              <p className="mt-4 text-lg text-muted-foreground">
                {post.summary}
              </p>

              {/* 标签 */}
              {post.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {post.tags.map((tag: string) => (
                    <Link
                      key={tag}
                      href={`/blog/tag/${tag.toLowerCase()}`}
                      className="tag-array text-xs"
                    >
                      <span className="group-hover:text-terminal-green transition-colors">{tag}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 文章内容 */}
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,240px] gap-12">
            {/* 主内容 */}
            <div className="mx-auto w-full max-w-3xl lg:max-w-none">
              {/* 文章内容终端框 */}
              <div className="terminal-window">
                <div className="terminal-header">
                  <div className="terminal-dot bg-red-400" />
                  <div className="terminal-dot bg-yellow-400" />
                  <div className="terminal-dot bg-terminal-green" />
                  <span className="ml-4 text-xs text-muted-foreground font-mono">
                    content.mdx
                  </span>
                </div>
                <div className="terminal-body">
                  <div className="prose prose-slate max-w-none dark:prose-invert prose-pre:max-w-full prose-pre:overflow-x-auto prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-terminal-green prose-code:text-terminal-green">
                    <PostContent code={post.mdx} />
                  </div>
                </div>
              </div>
            </div>

            {/* 侧边栏 TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-20">
                <div className="terminal-window">
                  <div className="terminal-header">
                    <div className="terminal-dot bg-red-400/50" />
                    <div className="terminal-dot bg-yellow-400/50" />
                    <div className="terminal-dot bg-terminal-green/50" />
                    <span className="ml-4 text-xs text-muted-foreground font-mono">
                      toc.txt
                    </span>
                  </div>
                  <div className="terminal-body">
                    <TableOfContents headings={post.headings} />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* 文章底部导航 */}
        <div className="border-t border-border bg-muted/30">
          {/* 扫描线效果 */}
          <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />

          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
            {/* 返回链接 */}
            <div className="flex justify-center mb-6">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-terminal-green transition-colors font-mono"
              >
                <ArrowLeft className="h-4 w-4" />
                cd ../blog
              </Link>
            </div>

            {/* 终端风格的相关文章 */}
            <div className="terminal-window max-w-2xl mx-auto">
              <div className="terminal-header">
                <div className="terminal-dot bg-red-400/50" />
                <div className="terminal-dot bg-yellow-400/50" />
                <div className="terminal-dot bg-terminal-green/50" />
                <span className="ml-4 text-xs text-muted-foreground font-mono">
                  ./related.sh
                </span>
              </div>
              <div className="terminal-body">
                <div className="text-sm font-mono text-muted-foreground">
                  <span className="text-terminal-green">$</span> cat related_posts.json
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  感谢阅读！如果觉得有用，欢迎分享~
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <SiteFooter />
    </>
  )
}
