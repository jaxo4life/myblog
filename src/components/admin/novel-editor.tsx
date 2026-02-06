'use client'

import { Textarea } from '@/components/ui/textarea'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

export function MarkdownEditor({
  content,
  onChange,
  placeholder = '输入 Markdown 内容...',
  className,
}: MarkdownEditorProps) {
  return (
    <div className={`terminal-window ${className || ''}`}>
      <div className="terminal-header">
        <div className="terminal-dot bg-red-400" />
        <div className="terminal-dot bg-yellow-400" />
        <div className="terminal-dot bg-terminal-green" />
        <span className="ml-4 text-xs text-muted-foreground font-mono">
          content.mdx
        </span>
      </div>

      {/* Markdown 编辑器 */}
      <div className="terminal-body !p-0">
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[500px] font-mono text-sm resize-y border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-4"
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        />
      </div>
    </div>
  )
}

// 保持向后兼容的导出
export function NovelEditor(props: MarkdownEditorProps) {
  return <MarkdownEditor {...props} />
}
