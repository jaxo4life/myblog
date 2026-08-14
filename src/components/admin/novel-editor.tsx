'use client'

import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { ImagePlus, Loader2 } from 'lucide-react'
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
 * 与最终文章页效果一致；rehype-raw 支持文章内嵌的裸 HTML（如 <a>），对齐前台 MDX 行为。
 * 三种视图：编辑 / 分屏 / 预览。零富文本依赖、无损往返。分屏时两侧按滚动比例同步。
 * 正文插图三入口：粘贴截图 / 拖拽文件 / 工具栏按钮，均先进暂存目录，保存时结算进 uploads。
 */
export function MarkdownEditor({
  content,
  onChange,
  placeholder,
  className,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<ViewMode>('split')
  const [uploading, setUploading] = useState(false)
  const editRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const syncing = useRef(false)
  // 渲染期同步最新 content：异步上传完成后据此替换占位符（闭包里的 content 是旧值）
  const contentRef = useRef(content)
  contentRef.current = content

  // 分屏滚动同步：按「已滚距离 / 可滚总距离」比例映射，避免行高不对齐导致错位
  function syncScroll(from: 'edit' | 'preview') {
    if (syncing.current) return
    const src = from === 'edit' ? editRef.current : previewRef.current
    const dst = from === 'edit' ? previewRef.current : editRef.current
    if (!src || !dst) return
    syncing.current = true
    const srcMax = src.scrollHeight - src.clientHeight
    const dstMax = dst.scrollHeight - dst.clientHeight
    if (srcMax > 0 && dstMax > 0) {
      dst.scrollTop = (src.scrollTop / srcMax) * dstMax
    }
    requestAnimationFrame(() => { syncing.current = false })
  }

  // 在光标处插入文本（受控 textarea：改 content + 重渲染后恢复光标）
  function insertAtCursor(text: string) {
    const el = editRef.current
    const cur = contentRef.current
    if (!el) {
      onChange(cur + text)
      return
    }
    const start = el.selectionStart ?? cur.length
    const end = el.selectionEnd ?? start
    onChange(cur.slice(0, start) + text + cur.slice(end))
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + text.length
    })
  }

  // 把占位符替换为最终 markdown；占位被用户手删则退化为光标处补插
  function replaceOrInsert(placeholder: string, md: string) {
    const cur = contentRef.current
    const idx = cur.indexOf(placeholder)
    if (idx === -1) {
      if (md) insertAtCursor(md)
      return
    }
    onChange(cur.slice(0, idx) + md + cur.slice(idx + placeholder.length))
    const el = editRef.current
    if (el) requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = idx + md.length
    })
  }

  // 上传图片并在光标处插入引用（多文件串行，逐个占位→替换）
  // 占位用纯文本：图片语法空 URL 会渲染出 <img src=""> 触发浏览器重新下载整页的警告
  async function uploadAndInsert(files: File[]) {
    if (files.length === 0) return
    setUploading(true)
    for (const file of files) {
      const alt = file.name.replace(/\.[^.]+$/, '') || 'image'
      const placeholder = `（上传中：${alt}…）`
      insertAtCursor(placeholder)
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.success) {
          replaceOrInsert(placeholder, `![${alt}](${data.data.url})`)
        } else {
          replaceOrInsert(placeholder, '')
          alert(data.error || '上传失败')
        }
      } catch {
        replaceOrInsert(placeholder, '')
        alert('上传失败')
      }
    }
    setUploading(false)
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const files = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith('image/'))
    if (files.length > 0) {
      e.preventDefault() // 阻止把图片文件名当文本粘入
      uploadAndInsert(files)
    }
  }

  function handleDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    if (files.length > 0) uploadAndInsert(files)
  }

  return (
    <div className={cn('terminal-window flex flex-col', className)}>
      <div className="terminal-header flex items-center justify-between !gap-0 shrink-0">
        <div className="flex items-center gap-2">
          <div className="terminal-dot bg-red-400" />
          <div className="terminal-dot bg-yellow-400" />
          <div className="terminal-dot bg-terminal-green" />
          <span className="ml-4 text-xs text-muted-foreground font-mono">content.mdx</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          {/* 插入图片（文件选择） */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? [])
              e.target.value = '' // 允许重复选择同一文件
              if (files.length > 0) uploadAndInsert(files)
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="插入图片（也可直接粘贴截图或拖拽文件进编辑区）"
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded transition-colors',
              'text-muted-foreground hover:text-foreground disabled:opacity-50'
            )}
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
          </button>

          {/* 视图切换 */}
          <div className="flex items-center gap-1">
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
      </div>

      {/* grid-rows-1 = minmax(0,1fr)：行高锁为容器高，item 才会内部滚动而非撑开行高 */}
      <div className={cn('grid grid-rows-1 flex-1 min-h-0', mode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1')}>
        {/* 编辑区 */}
        {(mode === 'edit' || mode === 'split') && (
          <textarea
            ref={editRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onScroll={() => mode === 'split' && syncScroll('edit')}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            placeholder={placeholder || '输入 Markdown 内容... 支持粘贴截图 / 拖拽图片'}
            spellCheck={false}
            className="h-full min-h-[500px] lg:min-h-0 font-mono text-sm p-4 resize-none border-0 rounded-none focus:outline-none bg-transparent border-r border-border overflow-y-auto no-scrollbar"
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
            }}
          />
        )}

        {/* 预览区 */}
        {(mode === 'preview' || mode === 'split') && (
          <div
            ref={previewRef}
            onScroll={() => mode === 'split' && syncScroll('preview')}
            className="h-full min-h-[500px] lg:min-h-0 p-4 overflow-auto no-scrollbar"
          >
            <div className="prose prose-slate dark:prose-invert max-w-none w-full lg:max-w-3xl mx-auto prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-code:text-terminal-green prose-a:text-terminal-green">
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">预览区为空，开始输入内容即可实时预览。</p>
              )}
            </div>
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
