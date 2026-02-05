'use client'

import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { getAllTags, getPostsByTag } from '@/lib/content'
import Link from 'next/link'
import { Terminal, List, Grid } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type ViewMode = 'list' | 'cloud'

export default function TagsPage() {
  const tags = getAllTags()
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  // 获取每个标签的文章数量
  const tagCounts = tags.map(tag => ({
    tag,
    count: getPostsByTag(tag).length
  })).sort((a, b) => b.count - a.count)

  const maxCount = Math.max(...tagCounts.map(t => t.count))

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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              文章标签
            </h1>
            <p className="text-muted-foreground">
              共 <span className="text-terminal-green">{tags.length}</span> 个标签，探索你感兴趣的内容
            </p>

            {/* 视图切换 */}
            <div className="mt-6 flex items-center justify-end gap-2">
              <span className="text-sm text-muted-foreground mr-2">视图:</span>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'list'
                    ? 'bg-terminal-green/10 text-terminal-green border border-terminal-green/30'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('cloud')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'cloud'
                    ? 'bg-terminal-green/10 text-terminal-green border border-terminal-green/30'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 终端窗口 */}
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dot bg-red-400" />
              <div className="terminal-dot bg-yellow-400" />
              <div className="terminal-dot bg-terminal-green" />
              <span className="ml-4 text-xs text-muted-foreground font-mono">
                tags/index.json
              </span>
            </div>

            <div className="terminal-body">
              {viewMode === 'list' ? (
                /* 列表视图 */
                <div className="space-y-2">
                  {tagCounts.map(({ tag, count }, index) => (
                    <Link
                      key={tag}
                      href={`/blog/tag/${encodeURIComponent(tag.toLowerCase())}`}
                      className="group block"
                    >
                      <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 border border-border hover:border-terminal-green/50 hover:bg-terminal-green/5 transition-all">
                        <span className="text-muted-foreground/50 font-mono text-sm w-8">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="tag-array flex-shrink-0">
                          <span className="group-hover:text-terminal-green transition-colors">{tag}</span>
                        </span>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-terminal-green to-cream-gold rounded-full transition-all"
                              style={{ width: `${(count / maxCount) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-muted-foreground">
                            [{count}]
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                /* 云视图 */
                <div className="flex flex-wrap gap-3 justify-center py-4">
                  {tagCounts.map(({ tag, count }) => {
                    const size = Math.min(1.5, Math.max(0.8, count / maxCount + 0.7))
                    return (
                      <Link
                        key={tag}
                        href={`/blog/tag/${encodeURIComponent(tag.toLowerCase())}`}
                        className="group"
                        style={{ fontSize: `${size}rem` }}
                      >
                        <span className="tag-array hover:border-terminal-green/50 hover:bg-terminal-green/5 transition-all">
                          <span className="group-hover:text-terminal-green transition-colors">
                            {tag}
                          </span>
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  )
}
