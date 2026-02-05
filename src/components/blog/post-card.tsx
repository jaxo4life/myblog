import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Terminal } from 'lucide-react'
import type { Post } from '@/lib/content'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface PostCardProps {
  post: Post
  variant?: 'default' | 'compact' | 'hero'
}

export function PostCard({ post, variant = 'default' }: PostCardProps) {
  const isHero = variant === 'hero'
  const isCompact = variant === 'compact'

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg',
        'bg-card-background border border-border',
        'transition-all duration-300 card-hover',
        {
          'h-full': !isHero,
          'row-span-2': isHero,
        }
      )}
    >
      {/* 封面图 */}
      {post.cover && (
        <div
          className={cn(
            'relative overflow-hidden bg-muted',
            isHero ? 'aspect-[16/9]' : 'aspect-[16/10]',
            isCompact && 'hidden'
          )}
        >
          <Image
            src={post.cover}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      )}

      {/* 内容 */}
      <div className={cn('flex flex-col flex-1 p-5', isHero && 'p-6')}>
        {/* 文件路径风格的元信息 */}
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-3">
          <Terminal className="h-3 w-3 text-terminal-green" />
          <span>~/blog/{post.slug.slice(0, 20)}{post.slug.length > 20 ? '...' : ''}</span>
        </div>

        {/* 标题 */}
        <h3
          className={cn(
            'font-bold text-gradient group-hover:underline decoration-terminal-green/50 underline-offset-4 transition-all',
            isHero ? 'text-2xl' : 'text-xl',
            isCompact && 'text-lg'
          )}
        >
          {post.title}
        </h3>

        {/* 摘要 */}
        {!isCompact && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
            {post.summary}
          </p>
        )}

        {/* 元信息 - 终端风格 */}
        <div className={cn('mt-auto pt-4', 'flex flex-wrap items-center gap-4 text-sm font-mono text-muted-foreground')}>
          <div className="flex items-center gap-1">
            <span className="text-terminal-green">date:</span>
            <time dateTime={post.date.toISOString()} className="text-foreground">
              {formatDate(post.date)}
            </time>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-cream-gold">read:</span>
            <span className="text-foreground">~{post.readingTime}min</span>
          </div>
        </div>

        {/* 标签 - 数组风格 */}
        <div className={cn('mt-4 flex flex-wrap gap-2', isCompact && 'mt-3')}>
          {post.tags.slice(0, isCompact ? 2 : 3).map((tag: string) => (
            <span
              key={tag}
              className="tag-array text-xs"
            >
              {tag}
            </span>
          ))}
          {post.tags.length > (isCompact ? 2 : 3) && (
            <span className="text-xs text-muted-foreground font-mono">
              [+{post.tags.length - (isCompact ? 2 : 3)}]
            </span>
          )}
        </div>
      </div>

      {/* 装饰性边框 - hover 时显示 */}
      <div className="absolute inset-0 border-2 border-terminal-green/0 group-hover:border-terminal-green/20 rounded-lg transition-all duration-300 pointer-events-none" />
    </Link>
  )
}
