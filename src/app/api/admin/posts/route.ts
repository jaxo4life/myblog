import { NextResponse } from 'next/server'
import { getPostList, createPost } from '@/lib/admin/fs'
import { PostData } from '@/types/admin'

export const runtime = 'nodejs'

// 获取文章列表
export async function GET() {
  try {
    const posts = await getPostList()
    return NextResponse.json({
      success: true,
      data: posts,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取文章列表失败',
    }, { status: 500 })
  }
}

// 处理 OPTIONS 请求（用于 CORS）
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 })
}

// 创建新文章
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { slug, title, date, summary, tags, draft, cover, featured, content } = body as PostData

    if (!slug || !title) {
      return NextResponse.json({
        success: false,
        error: 'slug 和 title 是必填项',
      }, { status: 400 })
    }

    await createPost({
      slug,
      title,
      date: date || new Date().toISOString().split('T')[0],
      summary: summary || '',
      tags: tags || [],
      draft: draft ?? true,
      cover,
      featured: featured ?? false,
      content: content || '',
    })

    return NextResponse.json({
      success: true,
      data: { slug },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '创建文章失败',
    }, { status: 500 })
  }
}
