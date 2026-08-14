'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

type ViewMode = 'edit' | 'split' | 'preview'

/**
 * Markdown 编辑器：左侧纯文本编辑 + 右侧实时预览。
 * 预览用 react-markdown 渲染（非 innerHTML，天然无 XSS），继承 prose 样式，
 * 与最终文章页效果一致。三种视图：编辑 / 分屏 / 预览。零富文本依赖、无损往返。
 */
export function MarkdownEditor({
  content,
  onChange,
  placeholder,
  className,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<ViewMode>('split')

  return (
    <div className={cn('terminal-window', className)}>
      <div className="terminal-header flex items-center justify-between !gap-0">
        <div className="flex items-center gap-2">
          <div className="terminal-dot bg-red-400" />
          <div className="terminal-dot bg-yellow-400" />
          <div className="terminal-dot bg-terminal-green" />
          <span className="ml-4 text-xs text-muted-foreground font-mono">content.mdx</span>
        </div>

        {/* 视图切换 */}
        <div className="flex items-center gap-1 text-xs font-mono">
          {(['edit', 'split', 'preview'] as ViewMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'px-2 py-1 rounded transition-colors',
                mode === m
                  ? 'text-terminal-green bg-terminal-green/10'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {m === 'edit' ? '编辑' : m === 'split' ? '分屏' : '预览'}
            </button>
          ))}
        </div>
      </div>

      <div className={cn('grid', mode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1')}>
        {/* 编辑区 */}
        {(mode === 'edit' || mode === 'split') && (
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || '输入 Markdown 内容...'}
            spellCheck={false}
            className="min-h-[500px] font-mono text-sm p-4 resize-y border-0 rounded-none focus:outline-none bg-transparent border-r border-border"
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
            }}
          />
        )}

        {/* 预览区 */}
        {(mode === 'preview' || mode === 'split') && (
          <div className="prose prose-slate dark:prose-invert max-w-none min-h-[500px] p-4 overflow-auto prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-code:text-terminal-green prose-a:text-terminal-green">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground">预览区为空，开始输入内容即可实时预览。</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// 向后兼容导出（编辑页仍以 NovelEditor 引用）
export function NovelEditor(props: MarkdownEditorProps) {
  return <MarkdownEditor {...props} />
}
