'use client'

import { useState } from 'react'
import Link from 'next/link'
import { List, Grid } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagItem {
  name: string
  slug: string
  count: number
}

type ViewMode = 'list' | 'cloud'

/**
 * 标签浏览器（列表 / 云视图切换）。
 * tags 由 server 端预算好 slug 后传入，client 不依赖 pinyin-pro。
 */
export function TagExplorer({ tags }: { tags: TagItem[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const maxCount = Math.max(1, ...tags.map((t) => t.count))

  return (
    <>
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

      {viewMode === 'list' ? (
        <div className="space-y-2">
          {tags.map(({ name, slug, count }, index) => (
            <Link key={slug} href={`/blog/tag/${slug}`} className="group block">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 border border-border hover:border-terminal-green/50 hover:bg-terminal-green/5 transition-all">
                <span className="text-muted-foreground/50 font-mono text-sm w-8">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="tag-array flex-shrink-0">
                  <span className="group-hover:text-terminal-green transition-colors">{name}</span>
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-terminal-green to-cream-gold rounded-full transition-all"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">[{count}]</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 justify-center py-4">
          {tags.map(({ name, slug, count }) => {
            const size = Math.min(1.5, Math.max(0.8, count / maxCount + 0.7))
            return (
              <Link
                key={slug}
                href={`/blog/tag/${slug}`}
                className="group"
                style={{ fontSize: `${size}rem` }}
              >
                <span className="tag-array hover:border-terminal-green/50 hover:bg-terminal-green/5 transition-all">
                  <span className="group-hover:text-terminal-green transition-colors">{name}</span>
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
