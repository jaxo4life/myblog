'use client'

import { useState, useEffect, useRef } from 'react'
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
import { ArrowLeft, GitCommit, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { pinyin } from 'pinyin-pro'

type MobileTab = 'content' | 'info'
type SaveState = 'idle' | 'saving' | 'error'

// 根据标题生成 slug（支持中文转拼音）
function generateSlugFromTitle(title: string): string {
  if (!title) return ''
  const currentYear = new Date().getFullYear()

  // 分离中文和非中文字符
  let result = ''
  let tempWord = ''

  for (const char of title) {
    // 判断是否为中文字符
    if (/[\u4e00-\u9fa5]/.test(char)) {
      // 先把之前累积的英文/数字加入结果
      if (tempWord) {
        result += tempWord.toLowerCase()
        tempWord = ''
      }
      // 中文转拼音
      result += pinyin(char, { toneType: 'none' })
    } else if (/[a-zA-Z0-9]/.test(char)) {
      // 英文/数字累积
      tempWord += char
    } else if (/\s/.test(char)) {
      // 空格作为分隔符
      if (tempWord) {
        result += tempWord.toLowerCase()
        tempWord = ''
      }
      if (result && !result.endsWith('-')) {
        result += '-'
      }
    }
  }

  // 处理最后剩余的英文
  if (tempWord) {
    result += tempWord.toLowerCase()
  }

  // 清理多余的连字符
  const kebabTitle = result
    .replace(/-+/g, '-') // 合并多个连字符
    .replace(/^-+|-+$/g, '') // 移除首尾连字符

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
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState('')
  const [changeCount, setChangeCount] = useState(0)
  const [changeFiles, setChangeFiles] = useState('')

  // ---- 自动保存 ----
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  // 已落盘的 slug（新建文章首次保存前为 null）；URL 参数可能是 'new'
  const savedSlugRef = useRef<string | null>(slug === 'new' ? null : slug)
  // 上次保存成功时的表单快照（null = 尚未初始化完成，加载中不保存）
  const lastSavedRef = useRef<string | null>(null)
  // 渲染期镜像：异步保存/flush 时读最新表单（闭包值是旧的）
  const formDataRef = useRef(formData)
  formDataRef.current = formData
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (slug && slug !== 'new') {
      fetchPost()
    } else {
      // 新建：以初始空表单为基线
      lastSavedRef.current = JSON.stringify(formDataRef.current)
      setLoading(false)
    }
    checkGitStatus()
    // 清掉上次编辑未保存残留的暂存图片（暂存不进 git，安全）
    fetch('/api/admin/upload', { method: 'DELETE' }).catch(() => {})
  }, [slug])

  async function checkGitStatus() {
    try {
      const res = await fetch('/api/admin/git/publish')
      const data = await res.json()
      if (data.success) {
        const files = data.status ? data.status.split('\n').filter(Boolean) : []
        setChangeCount(files.length)
        setChangeFiles(files.join('\n'))
      }
    } catch {}
  }

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
        const loaded = {
          title: data.data.title || '',
          slug: data.data.slug || '',
          content: data.data.content || '',
          summary: data.data.summary || '',
          tags: (data.data.tags || []).join(', '),
          date: data.data.date || new Date().toISOString().split('T')[0],
          draft: data.data.draft ?? true,
          cover: data.data.cover || '',
          featured: data.data.featured ?? false,
        }
        setFormData(loaded)
        // 以加载内容为基线，避免初始加载误触发自动保存
        lastSavedRef.current = JSON.stringify(loaded)
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
    } finally {
      setLoading(false)
    }
  }

  // 保存到磁盘。keepalive 用于页面卸载前的兜底保存。
  async function doSave(keepalive = false): Promise<boolean> {
    const data = formDataRef.current
    if (!data.title || !data.slug) return false

    const targetSlug = savedSlugRef.current
    // slug 形如 2026/xxx，保持多段路径（encodeURIComponent 会把 / 编成 %2F 破坏 catch-all 分段）
    const apiUrl = targetSlug
      ? `/api/admin/posts/${targetSlug}/`
      : '/api/admin/posts/'
    const method = targetSlug ? 'PUT' : 'POST'

    setSaveState('saving')
    try {
      const res = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
        keepalive,
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)

      lastSavedRef.current = JSON.stringify(data)
      setSavedAt(new Date())
      setSaveState('idle')
      // 同步已保存 slug（新建转正 / 改名跟随），后续 PUT 以它为基准；无刷新改写 URL
      if (savedSlugRef.current !== data.slug) {
        savedSlugRef.current = data.slug
        window.history.replaceState(null, '', `/admin/edit/${data.slug}`)
      }
      return true
    } catch {
      setSaveState('error')
      // 失败 5s 后自动重试（本地场景失败罕见：磁盘满 / dev server 重启中）
      if (retryTimer.current) clearTimeout(retryTimer.current)
      retryTimer.current = setTimeout(() => { void doSave() }, 5000)
      return false
    }
  }

  // 有未落盘变更时立即保存（失焦 / 切后台 / 卸载前兜底）
  function flushSave(keepalive = false) {
    if (lastSavedRef.current === null) return
    if (JSON.stringify(formDataRef.current) === lastSavedRef.current) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    void doSave(keepalive)
  }

  // 防抖自动保存：表单变化 2.5s 后落盘（标题/slug 就绪才开始，避免建半成品）
  useEffect(() => {
    if (lastSavedRef.current === null) return
    const snapshot = JSON.stringify(formData)
    if (snapshot === lastSavedRef.current) return
    if (!formData.title || !formData.slug) return

    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => { void doSave() }, 2500)
  }, [formData])

  // 失焦 / 切后台 / 关页前 flush（keepalive 保证卸载中请求也能发出）
  useEffect(() => {
    const onBlur = () => flushSave()
    const onVisibility = () => { if (document.hidden) flushSave() }
    const onBeforeUnload = () => flushSave(true)
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('beforeunload', onBeforeUnload)
      if (saveTimer.current) clearTimeout(saveTimer.current)
      if (retryTimer.current) clearTimeout(retryTimer.current)
    }
  }, [])

  async function handlePublish() {
    setPublishing(true)
    setMessage('')

    // 发布前强制落盘最新内容（git push 推的是工作区，避免发布旧版本）
    const saved = await doSave()
    if (!saved) {
      setPublishing(false)
      setMessage('✗ 内容不完整或保存失败，已中止发布')
      setTimeout(() => setMessage(''), 5000)
      return
    }

    try {
      const res = await fetch('/api/admin/git/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `更新文章: ${formDataRef.current.title}` }),
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
      checkGitStatus()
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
    <div className="min-h-screen lg:h-screen lg:flex lg:flex-col lg:overflow-hidden bg-background">
      <AdminHeader />

      {/* 顶部操作栏 */}
      <div className="border-b border-border bg-background lg:shrink-0">
        <div className="px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold hidden sm:block">{isNew ? '新建文章' : '编辑文章'}</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* 自动保存状态指示 */}
            {saveState === 'saving' ? (
              <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground font-mono">
                <Loader2 className="h-3 w-3 animate-spin" />
                保存中…
              </span>
            ) : saveState === 'error' ? (
              <span className="hidden sm:inline text-xs text-red-500 font-mono">
                ⚠ 保存失败，自动重试中
              </span>
            ) : savedAt ? (
              <span className="hidden sm:inline text-xs text-muted-foreground font-mono">
                ✓ 已保存 {savedAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            ) : null}

            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing || changeCount === 0}
              className="btn-terminal-outline flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-transparent border border-border text-foreground hover:border-terminal-green/50 hover:text-terminal-green disabled:opacity-50 disabled:cursor-not-allowed"
              title={changeCount > 0 ? `待发布文件：\n${changeFiles}` : '没有需要发布的更改'}
            >
              <GitCommit className="h-4 w-4" />
              <span className="hidden sm:inline">{publishing ? '发布中...' : changeCount > 0 ? `发布 (${changeCount})` : '无更改'}</span>
            </button>
            <Button type="button" variant="outline" onClick={() => router.push('/admin')}>
              返回
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

      <div className="px-4 lg:px-6 py-6 lg:py-4 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.includes('成功')
              ? 'bg-terminal-green/10 text-terminal-green'
              : 'bg-red-500/10 text-red-500'
          }`}>
            {message}
          </div>
        )}

        <div className="lg:h-full">
          <div className="flex flex-col lg:flex-row gap-6 lg:h-full lg:min-h-0">
            <div className={`flex-1 min-w-0 lg:h-full lg:flex lg:flex-col lg:min-h-0 ${mobileTab !== 'content' ? 'hidden lg:flex' : ''}`}>
              <div className="space-y-6 lg:flex lg:flex-col lg:flex-1 lg:min-h-0">
                <div className="lg:shrink-0">
                  <Label htmlFor="title">标题</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="text-lg"
                  />
                </div>

                <div className="lg:flex lg:flex-col lg:flex-1 lg:min-h-0">
                  <Label>文章内容</Label>
                  <NovelEditor
                    content={formData.content}
                    onChange={content => setFormData({ ...formData, content })}
                    className="lg:flex-1 lg:min-h-0"
                  />
                </div>
              </div>
            </div>

            <div className={`space-y-6 lg:w-80 lg:shrink-0 lg:overflow-y-auto no-scrollbar ${mobileTab === 'content' ? 'hidden lg:block' : ''}`}>
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
        </div>
      </div>

      <BackToTop />
    </div>
  )
}
