'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, FileText, EyeOff, GitCommit, Upload } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { BackToTop } from '@/components/admin/back-to-top'

export default function AdminPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [publishMessage, setPublishMessage] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const res = await fetch('/api/admin/posts/')
      const data = await res.json()
      if (data.success) {
        setPosts(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(slug: string) {
    try {
      const res = await fetch(`/api/admin/posts/${encodeURIComponent(slug)}/`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setPosts(posts.filter(p => p.slug !== slug))
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  async function handlePublish() {
    setPublishing(true)
    setPublishMessage('')

    try {
      const res = await fetch('/api/admin/git/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `更新文章内容 - ${new Date().toLocaleString('zh-CN')}` }),
      })

      const data = await res.json()
      if (data.success) {
        setPublishMessage('✓ ' + data.message)
      } else {
        setPublishMessage('✗ ' + data.message)
      }
    } catch (error: any) {
      setPublishMessage('✗ 发布失败: ' + error.message)
    } finally {
      setPublishing(false)
      setTimeout(() => setPublishMessage(''), 5000)
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
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/" className="text-lg font-bold">
            &larr; 返回博客
          </Link>
          <h1 className="text-xl font-bold">文章管理</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="btn-terminal-outline flex items-center gap-2 text-sm"
              title="一键发布到 Git"
            >
              <GitCommit className="h-4 w-4" />
              {publishing ? '发布中...' : '发布'}
            </button>
            <Link
              href="/admin/edit/new"
              className="btn-terminal flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              新建文章
            </Link>
          </div>
        </div>
        {publishMessage && (
          <div className={`px-6 py-2 text-sm border-t border-border ${
            publishMessage.includes('✓') ? 'text-terminal-green' : 'text-red-500'
          }`}>
            {publishMessage}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Mobile: 卡片布局 */}
        <div className="lg:hidden space-y-4">
          {posts.map((post) => (
            <div key={post.slug} className="terminal-window">
              <div className="terminal-body">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
                    <p className="text-xs text-muted-foreground font-mono mt-1">{post.slug}</p>
                  </div>
                  {post.draft ? (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-xs">
                      <EyeOff className="h-3 w-3" />
                      草稿
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-terminal-green/10 text-terminal-green text-xs">
                      已发布
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {formatDate(new Date(post.date))}
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags?.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="tag-array text-xs">
                      {tag}
                    </span>
                  ))}
                  {(post.tags?.length || 0) > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{(post.tags?.length || 0) - 3}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <Link
                    href={`/admin/edit/${post.slug}`}
                    className="text-sm text-terminal-green hover:underline flex items-center gap-1"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    编辑
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(deleteConfirm === post.slug ? null : post.slug)}
                    className="text-sm text-muted-foreground hover:text-red-500 flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deleteConfirm === post.slug ? '取消' : '删除'}
                  </button>
                </div>
                {deleteConfirm === post.slug && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">确认删除此文章？</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(post.slug)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                      >
                        确认删除
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1 bg-muted rounded text-sm"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="terminal-window">
              <div className="terminal-body text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">还没有文章</p>
                <Link
                  href="/admin/edit/new"
                  className="text-terminal-green hover:underline"
                >
                  创建第一篇文章 &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Desktop: 表格布局 */}
        <div className="hidden lg:block">
          <div className="terminal-window">
            <div className="terminal-header">
              <span className="text-xs text-muted-foreground font-mono">
                posts.json
              </span>
            </div>
            <div className="terminal-body p-0">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">标题</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">日期</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">状态</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">标签</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {posts.map((post) => (
                    <tr key={post.slug} className="hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{post.title}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 font-mono">
                          {post.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatDate(new Date(post.date))}
                      </td>
                      <td className="px-6 py-4">
                        {post.draft ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-xs">
                            <EyeOff className="h-3 w-3" />
                            草稿
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-terminal-green/10 text-terminal-green text-xs">
                            已发布
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {post.tags?.slice(0, 2).map((tag: string) => (
                            <span key={tag} className="tag-array text-xs">
                              {tag}
                            </span>
                          ))}
                          {(post.tags?.length || 0) > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{(post.tags?.length || 0) - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/edit/${post.slug}`}
                            className="p-2 rounded-md hover:bg-muted transition-colors"
                            title="编辑"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          {deleteConfirm === post.slug ? (
                            <>
                              <button
                                onClick={() => handleDelete(post.slug)}
                                className="p-2 rounded-md bg-red-500 text-white"
                                title="确认删除"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="p-2 rounded-md bg-muted"
                                title="取消"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(post.slug)}
                              className="p-2 rounded-md hover:bg-red-500/10 hover:text-red-500 transition-colors"
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>还没有文章</p>
                        <Link
                          href="/admin/edit/new"
                          className="text-terminal-green hover:underline"
                        >
                          创建第一篇文章 &rarr;
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <BackToTop />
    </div>
  )
}
