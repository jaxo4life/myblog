'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminHeader from '@/components/admin/admin-header'
import { NovelEditor } from '@/components/admin/novel-editor'
import { ImageUpload } from '@/components/admin/image-upload'
import { BackToTop } from '@/components/admin/back-to-top'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, GitCommit } from 'lucide-react'
import Link from 'next/link'

type MobileTab = 'content' | 'info'

// 根据标题生成 slug
function generateSlugFromTitle(title: string): string {
  if (!title) return ''
  const currentYear = new Date().getFullYear()
  // 将标题转为 kebab-case
  const kebabTitle = title
    .toLowerCase()
    .trim()
    .replace(/[\s\W_]+/g, '-') // 替换非字母数字字符为连字符
    .replace(/^-+|-+$/g, '') // 移除首尾连字符
    .replace(/-+/g, '-') // 合并多个连字符
  return `${currentYear}/${kebabTitle}`
}

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug || ''
  const [mobileTab, setMobileTab] = useState<MobileTab>('content')
  const isNew = slug === 'new'

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    summary: '',
    tags: '',
    date: new Date().toISOString().split('T')[0],
    draft: true,
    cover: '',
    featured: false,
  })

  // 跟踪用户是否手动编辑过 slug
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (slug && slug !== 'new') {
      fetchPost()
    } else {
      setLoading(false)
    }
  }, [slug])

  // 标题变化时自动生成 slug（仅新建文章且用户未手动编辑过 slug 时）
  useEffect(() => {
    if (isNew && !slugManuallyEdited && formData.title) {
      setFormData(prev => ({ ...prev, slug: generateSlugFromTitle(formData.title) }))
    }
  }, [formData.title, isNew, slugManuallyEdited])

  async function fetchPost() {
    try {
      const res = await fetch(`/api/admin/posts/${slug}/`)
      const data = await res.json()
      if (data.success) {
        setFormData({
          title: data.data.title || '',
          slug: data.data.slug || '',
          content: data.data.content || '',
          summary: data.data.summary || '',
          tags: (data.data.tags || []).join(', '),
          date: data.data.date || new Date().toISOString().split('T')[0],
          draft: data.data.draft ?? true,
          cover: data.data.cover || '',
          featured: data.data.featured ?? false,
        })
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const apiUrl = slug === 'new'
        ? '/api/admin/posts/'
        : `/api/admin/posts/${slug}/`

      const method = slug === 'new' ? 'POST' : 'PUT'

      const res = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage('文章保存成功！')
        setTimeout(() => router.push('/admin'), 1000)
      } else {
        setMessage(`保存失败：${data.error}`)
      }
    } catch (error) {
      setMessage('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish() {
    setPublishing(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/git/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `更新文章: ${formData.title}` }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage('✓ ' + data.message)
      } else {
        setMessage('✗ ' + data.message)
      }
    } catch (error: any) {
      setMessage('✗ 发布失败: ' + error.message)
    } finally {
      setPublishing(false)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      {/* 顶部操作栏 */}
      <div className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold hidden sm:block">{isNew ? '新建文章' : '编辑文章'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="btn-terminal-outline flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-transparent border border-border text-foreground hover:border-terminal-green/50 hover:text-terminal-green disabled:opacity-50 disabled:cursor-not-allowed"
              title="保存并发布到 Git"
            >
              <GitCommit className="h-4 w-4" />
              <span className="hidden sm:inline">{publishing ? '发布中...' : '发布'}</span>
            </button>
            <Button type="button" variant="outline" onClick={() => router.push('/admin')}>
              取消
            </Button>
            <Button type="submit" disabled={saving} className="btn-terminal" onClick={(e) => {
              const form = document.querySelector('form')
              if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
            }}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>

        {/* 移动端标签切换 */}
        <div className="lg:hidden flex border-t border-border">
          <button
            onClick={() => setMobileTab('content')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              mobileTab === 'content'
                ? 'text-foreground border-b-2 border-terminal-green'
                : 'text-muted-foreground'
            }`}
          >
            文章内容
          </button>
          <button
            onClick={() => setMobileTab('info')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              mobileTab === 'info'
                ? 'text-foreground border-b-2 border-terminal-green'
                : 'text-muted-foreground'
            }`}
          >
            基本信息
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.includes('成功')
              ? 'bg-terminal-green/10 text-terminal-green'
              : 'bg-red-500/10 text-red-500'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 ${mobileTab !== 'content' ? 'hidden lg:block' : ''}`}>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title">标题</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="text-lg"
                  />
                </div>

                <div>
                  <Label>文章内容</Label>
                  <NovelEditor
                    content={formData.content}
                    onChange={content => setFormData({ ...formData, content })}
                  />
                </div>
              </div>
            </div>

            <div className={`space-y-6 ${mobileTab === 'content' ? 'hidden lg:block' : ''}`}>
              <div className="terminal-window">
                <div className="terminal-header">
                  <span className="text-xs text-muted-foreground font-mono">metadata.json</span>
                </div>
                <div className="terminal-body space-y-4">
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={e => {
                        setFormData({ ...formData, slug: e.target.value })
                        setSlugManuallyEdited(true)
                      }}
                      required
                      placeholder="2023/my-post"
                    />
                  </div>

                  <div>
                    <Label htmlFor="summary">摘要</Label>
                    <Textarea
                      id="summary"
                      value={formData.summary}
                      onChange={e => setFormData({ ...formData, summary: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags">标签（逗号分隔）</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={e => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="React, Next.js, TypeScript"
                    />
                  </div>

                  <div>
                    <Label htmlFor="date">发布日期</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="draft">草稿</Label>
                    <Switch
                      id="draft"
                      checked={formData.draft}
                      onCheckedChange={draft => setFormData({ ...formData, draft })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="featured">精选</Label>
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={featured => setFormData({ ...formData, featured })}
                    />
                  </div>

                  <div>
                    <Label>封面图片</Label>
                    <ImageUpload
                      value={formData.cover}
                      onChange={cover => setFormData({ ...formData, cover })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <BackToTop />
    </div>
  )
}
