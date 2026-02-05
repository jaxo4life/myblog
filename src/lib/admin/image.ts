import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { UploadedImage } from '@/types/admin'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

// 确保上传目录存在
async function ensureUploadDir() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const dir = path.join(UPLOAD_DIR, String(year), month)

  try {
    await mkdir(dir, { recursive: true })
  } catch {
    // 目录已存在
  }

  return { year, month, dir }
}

// 生成唯一文件名
function generateFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = path.extname(originalName)
  return `${timestamp}-${random}${ext}`
}

// 处理图片上传
export async function uploadImage(
  file: File | Buffer,
  filename: string
): Promise<UploadedImage> {
  const { year, month, dir } = await ensureUploadDir()
  const uniqueFilename = generateFilename(filename)
  const filePath = path.join(dir, uniqueFilename)

  let buffer: Buffer

  if (typeof File !== 'undefined' && file instanceof File) {
    // File 对象（浏览器环境）
    const arrayBuffer = await file.arrayBuffer()
    buffer = Buffer.from(arrayBuffer)
  } else if (Buffer.isBuffer(file)) {
    // Buffer 对象（Node.js 环境）
    buffer = file
  } else {
    // 其他情况，尝试转换为 Buffer
    buffer = Buffer.from(file as unknown as ArrayBufferLike)
  }

  // 使用 sharp 处理图片
  const image = sharp(buffer)
  const metadata = await image.metadata()

  // 如果图片太大，进行压缩
  let processedImage = image
  if (metadata.width && metadata.width > 2000) {
    processedImage = image.resize(2000, null, {
      withoutEnlargement: true,
      fit: 'inside',
    })
  }

  // 转换为 jpeg 并压缩质量
  const processedBuffer = await processedImage
    .jpeg({ quality: 85 })
    .toBuffer()

  await writeFile(filePath, processedBuffer)

  // 获取处理后的元数据
  const finalMetadata = await sharp(processedBuffer).metadata()

  return {
    url: `/uploads/${year}/${month}/${uniqueFilename}`,
    filename: uniqueFilename,
    width: finalMetadata.width || 0,
    height: finalMetadata.height || 0,
  }
}

// 删除图片
export async function deleteImage(url: string): Promise<void> {
  const filePath = path.join(process.cwd(), 'public', url)
  const sharp = require('sharp')
  // 这里简化处理，实际应该检查文件是否存在
  const fs = require('fs/promises')
  try {
    await fs.unlink(filePath)
  } catch {
    // 文件不存在或已删除
  }
}
