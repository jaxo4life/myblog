import { NextResponse } from 'next/server'
import { uploadImage } from '@/lib/admin/image'

export const runtime = 'nodejs'

// 上传图片
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({
        success: false,
        error: '没有上传文件',
      }, { status: 400 })
    }

    const result = await uploadImage(file, file.name)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '上传失败',
    }, { status: 500 })
  }
}
