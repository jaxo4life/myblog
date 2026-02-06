import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { PostGrid } from '@/components/blog/post-grid'
import { getPaginatedPosts } from '@/lib/content'
import { Pagination } from '@/components/blog/pagination'
import { Terminal } from 'lucide-react'
import { redirect } from 'next/navigation'

interface BlogPageProps {
  params: Promise<{ page: string }>
}

export async function generateStaticParams() {
  const { getPublishedPosts } = await import('@/lib/content')
  const posts = getPublishedPosts()
  const totalPages = Math.ceil(posts.length / 9)

  return Array.from({ length: totalPages }, (_, i) => ({
    page: String(i + 1),
  }))
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { page } = await params
  const pageNum = parseInt(page, 10)
  const { getPublishedPosts } = await import('@/lib/content')
  const posts = getPublishedPosts()
  const totalPages = Math.ceil(posts.length / 9)

  if (pageNum < 1 || pageNum > totalPages) {
    redirect('/blog')
  }

  const { posts: pagePosts, pagination } = getPaginatedPosts(pageNum, 9)

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen py-12 bg-muted/30 pb-20 md:pb-12 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent pointer-events-none" />
        <div className="decorative-blob bg-terminal-green/5 w-64 h-64 -top-32 -right-32 pointer-events-none max-w-none" />
        <div className="decorative-blob bg-cream-gold/5 w-48 h-48 top-20 left-20 pointer-events-none max-w-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full relative z-10">
          {/* 页面标题 */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4 font-mono text-sm text-muted-foreground">
              <Terminal className="h-4 w-4 text-terminal-green" />
              <span>$ ls posts/ -page {pageNum} --per-page=9</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              <span className="text-gradient">博客文章</span>
            </h1>
            <p className="mt-2 text-muted-foreground font-mono text-sm">
              <span className="text-terminal-green">total:</span> {pagination.totalPosts} 文章
              <span className="mx-3 text-muted-foreground/50">|</span>
              <span className="text-cream-gold">page:</span> {pagination.currentPage}/{pagination.totalPages}
            </p>
          </div>

          {/* 文章网格 */}
          <PostGrid posts={pagePosts} showHero={false} />

          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <div className="mt-12">
              <Pagination pagination={pagination} basePath="/blog/page" />
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  )
}
