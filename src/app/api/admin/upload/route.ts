import { NextResponse } from 'next/server'
import { uploadImage, cleanStagingCache } from '@/lib/admin/image'
import { verifyAuth, unauthorized } from '@/lib/admin/auth'

export const runtime = 'nodejs'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

// 上传图片（进暂存目录 public/cache/uploads，保存文章时才结算进 public/uploads）
export async function POST(request: Request) {
  if (!verifyAuth(request)) return unauthorized()

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: '没有上传文件' },
        { status: 400 }
      )
    }

    // 文件类型白名单
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `不支持的文件类型：${file.type || '未知'}，仅支持 JPG/PNG/WebP/GIF`,
        },
        { status: 400 }
      )
    }

    // 文件大小限制
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: '文件过大，最大支持 10MB' },
        { status: 400 }
      )
    }

    const result = await uploadImage(file, file.name)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '上传失败',
      },
      { status: 500 }
    )
  }
}

// 清空暂存目录（编辑页进入时 / 保存成功后调用）
export async function DELETE(request: Request) {
  if (!verifyAuth(request)) return unauthorized()

  try {
    await cleanStagingCache()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '清理暂存图片失败',
      },
      { status: 500 }
    )
  }
}
