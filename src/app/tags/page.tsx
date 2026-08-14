import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { getAllTagsWithSlug } from '@/lib/content'
import { TagExplorer } from '@/components/blog/tag-explorer'
import { Terminal } from 'lucide-react'

export default function TagsPage() {
  const tags = getAllTagsWithSlug()

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen py-12 bg-muted/30 pb-20 md:pb-12 relative">
        {/* 装饰 */}
        <div className="decorative-blob bg-terminal-green/5 w-64 h-64 -top-32 -right-32" />
        <div className="decorative-blob bg-cream-gold/5 w-48 h-48 top-20 left-20" />

        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          {/* 标题区域 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 font-mono text-sm text-muted-foreground">
              <Terminal className="h-4 w-4 text-terminal-green" />
              <span>$ ls -la tags/</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">文章标签</h1>
            <p className="text-muted-foreground">
              共 <span className="text-terminal-green">{tags.length}</span> 个标签，探索你感兴趣的内容
            </p>
          </div>

          {/* 终端窗口 */}
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dot bg-red-400" />
              <div className="terminal-dot bg-yellow-400" />
              <div className="terminal-dot bg-terminal-green" />
              <span className="ml-4 text-xs text-muted-foreground font-mono">tags/index.json</span>
            </div>

            <div className="terminal-body">
              <TagExplorer tags={tags} />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  )
}
