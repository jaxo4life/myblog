import { NextResponse } from 'next/server'
import { getPost, updatePost, deletePost } from '@/lib/admin/fs'
import { PostData } from '@/types/admin'

export const runtime = 'nodejs'

// 获取文章详情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params
    // slug 是数组，去掉可能存在的空字符串（来自尾随斜杠）
    const slugParts = Array.isArray(slug) ? slug.filter(s => s) : [slug]
    const slugStr = slugParts.join('/')
    const post = await getPost(slugStr)

    if (!post) {
      return NextResponse.json({
        success: false,
        error: '文章不存在',
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: post,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取文章失败',
    }, { status: 500 })
  }
}

// 更新文章
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params
    const slugParts = Array.isArray(slug) ? slug.filter(s => s) : [slug]
    const slugStr = slugParts.join('/')
    const body = await request.json()
    const { slug: newSlug, title, date, summary, tags, draft, cover, featured, content } = body as PostData

    const postData: PostData = {
      slug: newSlug || slugStr,
      title,
      date: date || new Date().toISOString().split('T')[0],
      summary: summary || '',
      tags: tags || [],
      draft: draft ?? true,
      cover,
      featured: featured ?? false,
      content: content || '',
    }

    await updatePost(slugStr, postData)

    return NextResponse.json({
      success: true,
      data: postData,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '更新文章失败',
    }, { status: 500 })
  }
}

// 删除文章
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params
    const slugParts = Array.isArray(slug) ? slug.filter(s => s) : [slug]
    const slugStr = slugParts.join('/')
    await deletePost(slugStr)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '删除文章失败',
    }, { status: 500 })
  }
}
