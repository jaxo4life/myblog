import { NextResponse } from 'next/server'
import { verifyAuth, unauthorized } from '@/lib/admin/auth'
import { getChangedContentFiles, publishChanges } from '@/lib/admin/git'

export const runtime = 'nodejs'

// 一键发布：逻辑在 lib/admin/git（可测试），route 只负责鉴权 + HTTP 包装
export async function POST(request: Request) {
  if (!verifyAuth(request)) return unauthorized()

  try {
    const body = await request.json().catch(() => ({}))
    const { message } = body as { message?: string }
    const commitMessage = message || '更新文章内容'

    const results = await publishChanges(commitMessage)
    const noChanges = results.some((r) => r.includes('没有需要提交'))

    return NextResponse.json({
      success: !noChanges,
      message: noChanges ? '没有需要提交的变更' : '发布成功！',
      results,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || '发布失败', results: [] },
      { status: 500 }
    )
  }
}

// 获取内容目录的 git 状态
export async function GET(request: Request) {
  if (!verifyAuth(request)) return unauthorized()

  try {
    const status = await getChangedContentFiles()
    return NextResponse.json({
      success: true,
      hasChanges: status.length > 0,
      status,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
