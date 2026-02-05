import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { PostGrid } from '@/components/blog/post-grid'
import { getPaginatedPosts } from '@/lib/content'
import Link from 'next/link'
import { Terminal, BookOpen } from 'lucide-react'

export default function BlogPage() {
  const { posts, pagination } = getPaginatedPosts(1, 9)

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen py-12 bg-muted/30 pb-20 md:pb-12 relative">
        {/* 背景装饰 */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent" />
        <div className="decorative-blob bg-terminal-green/5 w-64 h-64 -top-32 -right-32" />
        <div className="decorative-blob bg-cream-gold/5 w-48 h-48 top-20 left-20" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
          {/* 页面标题 */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4 font-mono text-sm text-muted-foreground">
              <Terminal className="h-4 w-4 text-terminal-green" />
              <span>$ ls -la posts/</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              <span className="text-gradient">博客文章</span>
            </h1>
            <p className="mt-2 text-muted-foreground font-mono text-sm">
              <span className="text-terminal-green">total</span> {pagination.totalPosts} 文章
            </p>
          </div>

          {/* 文章网格 */}
          <PostGrid posts={posts} showHero={false} />

          {/* 分页链接 */}
          {pagination.totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <Link
                href="/blog/page/2"
                className="btn-terminal group"
              >
                <Terminal className="h-4 w-4" />
                ./next_page
                <BookOpen className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  )
}
