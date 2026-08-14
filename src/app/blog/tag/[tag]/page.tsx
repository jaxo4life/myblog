import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { getPostsByTag, getAllTags, slugToTag, tagToSlug } from '@/lib/content'
import { PostGrid } from '@/components/blog/post-grid'
import { Terminal, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface TagPageProps {
  params: Promise<{ tag: string }>
}

// 生成拼音 slug 作为静态参数（URL 不再是百分号编码的中文）
export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: tagToSlug(tag) }))
}

export async function generateMetadata({ params }: TagPageProps) {
  const { tag } = await params
  const tagName = slugToTag(tag)
  if (!tagName) return {}
  return {
    title: `标签: ${tagName}`,
    description: `查看所有带有 ${tagName} 标签的文章`,
    alternates: { canonical: `/blog/tag/${tag}` },
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params
  // URL slug 反查回中文标签名（用于显示和查询）
  const tagName = slugToTag(tag)

  if (!tagName) {
    notFound()
  }

  const posts = getPostsByTag(tagName)

  if (posts.length === 0) {
    notFound()
  }

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen py-12 bg-muted/30 pb-20 md:pb-12">
        {/* 背景装饰 */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent" />
        <div className="decorative-blob bg-terminal-green/5 w-64 h-64 -top-32 -right-32" />
        <div className="decorative-blob bg-cream-gold/5 w-48 h-48 top-20 left-20" />
        <div className="absolute inset-0 bg-grid opacity-20" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* 页面标题 */}
          <div className="mb-12">
            {/* 面包屑 */}
            <div className="mb-6 text-sm font-mono text-muted-foreground">
              <Link href="/" className="hover:text-terminal-green transition-colors">
                ~/
              </Link>
              <span className="text-terminal-green/50">/</span>
              <Link href="/tags" className="hover:text-terminal-green transition-colors">
                tags
              </Link>
              <span className="text-terminal-green/50">/</span>
              <span className="text-foreground">{tagName}</span>
            </div>

            {/* 终端命令 */}
            <div className="flex items-center gap-2 mb-4 font-mono text-sm text-muted-foreground">
              <Terminal className="h-4 w-4 text-terminal-green" />
              <span>$ grep -r &apos;{tagName}&apos; posts/</span>
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-2">
              <span className="text-gradient">标签: {tagName}</span>
            </h1>
            <p className="mt-2 text-muted-foreground font-mono text-sm">
              <span className="text-terminal-green">found:</span> {posts.length} 篇文章
            </p>
          </div>

          {/* 文章网格 */}
          <PostGrid posts={posts} showHero={false} />

          {/* 返回链接 */}
          <div className="mt-12">
            <Link
              href="/tags"
              className="btn-terminal-outline font-mono inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              cd ../tags
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  )
}
