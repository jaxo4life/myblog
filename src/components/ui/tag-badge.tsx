import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TagBadgeProps {
  tag: string
  count?: number
  className?: string
}

export function TagBadge({ tag, count, className }: TagBadgeProps) {
  return (
    <Link
      href={`/blog/tag/${encodeURIComponent(tag.toLowerCase())}`}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm',
        'bg-muted hover:bg-accent text-foreground transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        className
      )}
    >
      <span>#{tag}</span>
      {count !== undefined && (
        <span className="text-muted-foreground">({count})</span>
      )}
    </Link>
  )
}
