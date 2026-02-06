import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  pagination: {
    currentPage: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  basePath: string
}

export function Pagination({ pagination, basePath }: PaginationProps) {
  const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination

  // 生成页码数组
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }

    return pages
  }

  const pages = getPageNumbers()

  return (
    <nav className="flex flex-col items-center gap-4" aria-label="分页导航">
      {/* 终端命令风格提示 */}
      <div className="text-xs font-mono text-muted-foreground">
        <span className="text-terminal-green">$</span> pagination --current={currentPage} --total={totalPages}
      </div>

      {/* 分页控件 */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* 上一页 */}
        {hasPrevPage ? (
          <Link
            href={`${basePath}/${currentPage - 1}`}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-md font-mono text-sm',
              'border border-border hover:border-terminal-green/50',
              'text-foreground hover:text-terminal-green hover:bg-terminal-green/5',
              'transition-all'
            )}
            aria-label="上一页"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">prev</span>
          </Link>
        ) : (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-md font-mono text-sm',
              'border border-border text-muted-foreground cursor-not-allowed'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">prev</span>
          </span>
        )}

        {/* 页码 */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((page, index) => {
            if (typeof page === 'string') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground font-mono">
                  {page === '...' ? '...' : page}
                </span>
              )
            }

            const isActive = page === currentPage

            return (
              <Link
                key={page}
                href={`${basePath}/${page}`}
                className={cn(
                  'inline-flex items-center justify-center w-10 h-10 rounded-md font-mono text-sm',
                  'border transition-all duration-200',
                  isActive
                    ? 'bg-terminal-green text-black border-terminal-green shadow-lg shadow-terminal-green/20'
                    : 'border-border text-foreground hover:border-terminal-green/50 hover:text-terminal-green hover:bg-terminal-green/5'
                )}
                aria-label={`第 ${page} 页`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
              </Link>
            )
          })}
        </div>

        {/* 移动端显示当前页/总页数 */}
        <span className="sm:hidden text-sm font-mono text-muted-foreground">
          [{currentPage}/{totalPages}]
        </span>

        {/* 下一页 */}
        {hasNextPage ? (
          <Link
            href={`${basePath}/${currentPage + 1}`}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-md font-mono text-sm',
              'border border-border hover:border-terminal-green/50',
              'text-foreground hover:text-terminal-green hover:bg-terminal-green/5',
              'transition-all'
            )}
            aria-label="下一页"
          >
            <span className="hidden sm:inline">next</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-md font-mono text-sm',
              'border border-border text-muted-foreground cursor-not-allowed'
            )}
          >
            <span className="hidden sm:inline">next</span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  )
}
