'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { cn } from '@/lib/utils'
import { markdownToHtml, htmlToMarkdown } from '@/lib/mdx-to-html'

interface NovelEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  isMarkdown?: boolean // 是否输入内容为 markdown 格式
}

export function NovelEditor({
  content,
  onChange,
  placeholder = '输入内容，输入 / 可以插入特殊内容...',
  className,
  isMarkdown = true, // 默认为 markdown 格式
}: NovelEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-4',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-terminal-green/30 pl-4 italic text-muted-foreground',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-secondary rounded-lg p-4 font-mono text-sm overflow-x-auto break-words',
          },
        },
        code: {
          HTMLAttributes: {
            class: 'bg-muted px-1.5 py-0.5 rounded text-sm font-mono',
          },
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-terminal-green hover:underline underline-offset-4',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: isMarkdown ? markdownToHtml(content) : content,
    onUpdate: ({ editor }) => {
      // 输出时转换回 markdown 格式
      const html = editor.getHTML()
      onChange(isMarkdown ? htmlToMarkdown(html) : html)
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-slate max-w-none dark:prose-invert focus:outline-none min-h-[400px] px-4 py-3',
          'prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground',
          'prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl',
          'prose-p:leading-relaxed prose-p:my-3 prose-p:text-muted-foreground',
          'prose-ul:my-3 prose-li:my-1',
          'prose-blockquote:not-italic',
          'prose-strong:text-foreground',
          'prose-a:text-terminal-green prose-a:hover:underline',
          'prose-code:text-terminal-green',
          'prose-pre:bg-secondary prose-pre:border prose-pre:border-border',
          className
        ),
      },
    },
  })

  // 同步外部内容变化
  useEffect(() => {
    if (!editor) return

    // 将 markdown 转换为 HTML 后比较
    const htmlContent = isMarkdown ? markdownToHtml(content) : content
    if (htmlContent !== editor.getHTML()) {
      editor.commands.setContent(htmlContent, false)
    }
  }, [content, editor, isMarkdown])

  if (!editor) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-muted-foreground">
        加载编辑器...
      </div>
    )
  }

  return (
    <div className="terminal-window">
      <div className="terminal-header">
        <div className="terminal-dot bg-red-400" />
        <div className="terminal-dot bg-yellow-400" />
        <div className="terminal-dot bg-terminal-green" />
        <span className="ml-4 text-xs text-muted-foreground font-mono">
          content.mdx
        </span>
      </div>
      {/* 工具栏 */}
      <EditorToolbar editor={editor} />
      {/* 编辑器 */}
      <div className="terminal-body !p-0">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null

  return (
    <div className="border-b border-border bg-secondary/50 p-2 flex flex-wrap gap-1">
      {/* 标题 */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
      >
        H3
      </ToolbarButton>

      <div className="w-px h-6 bg-border mx-1" />

      {/* 文本格式 */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
      >
        <s>S</s>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
      >
        {'<>'}
      </ToolbarButton>

      <div className="w-px h-6 bg-border mx-1" />

      {/* 列表 */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
      >
        • 列表
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
      >
        1. 列表
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
      >
        &quot; 引用
      </ToolbarButton>

      <div className="w-px h-6 bg-border mx-1" />

      {/* 代码块 */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')}
      >
        {'</>'} 代码
      </ToolbarButton>

      <div className="w-px h-6 bg-border mx-1" />

      {/* 撤销重做 */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        ↶
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        ↷
      </ToolbarButton>
    </div>
  )
}

function ToolbarButton({
  children,
  onClick,
  active = false,
  disabled = false,
}: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-3 py-1.5 rounded text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-foreground',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        active && 'bg-accent text-foreground'
      )}
    >
      {children}
    </button>
  )
}
