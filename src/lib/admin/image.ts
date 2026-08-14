import { writeFile, mkdir, rename, rm } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { UploadedImage } from '@/types/admin'

const UPLOAD_URL_PREFIX = '/uploads/'
// 暂存目录：上传先进这里（gitignore，不进仓库/静态产物），保存文章时才结算进 uploads
const STAGING_DIR = path.join(process.cwd(), 'public', 'cache', 'uploads')
export const STAGING_URL_PREFIX = '/cache/uploads/'

// 确保目录存在（按年/月分目录，结构与 uploads 一致）
async function ensureDirByDate(baseDir: string) {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const dir = path.join(baseDir, String(year), month)

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

/**
 * 处理图片上传：写入暂存目录（public/cache/uploads/YYYY/MM/）。
 * 未保存文章前图片不进 public/uploads，避免"上传后不保存"留下孤儿文件。
 */
export async function uploadImage(
  file: File | Buffer,
  filename: string
): Promise<UploadedImage> {
  const { year, month, dir } = await ensureDirByDate(STAGING_DIR)
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
    url: `${STAGING_URL_PREFIX}${year}/${month}/${uniqueFilename}`,
    filename: uniqueFilename,
    width: finalMetadata.width || 0,
    height: finalMetadata.height || 0,
  }
}

/**
 * 提取文本中引用的暂存图片 URL（纯函数，供测试）。
 * 匹配 cover 字段值与 markdown 图片 `![](...)` 两种形态。
 */
export function extractStagedUrls(text: string): string[] {
  const urls = new Set<string>()
  for (const m of text.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) {
    if (m[1].startsWith(STAGING_URL_PREFIX)) urls.add(m[1])
  }
  return Array.from(urls)
}

/**
 * 把文本中的暂存 URL 改写为正式 uploads URL（纯函数，供测试）。
 * 返回改写后的文本与涉及的暂存 URL 列表。
 */
export function rewriteStagedRefs(text: string): { text: string; stagedUrls: string[] } {
  const stagedUrls = extractStagedUrls(text)
  let result = text
  for (const url of stagedUrls) {
    result = result.split(url).join(UPLOAD_URL_PREFIX + url.slice(STAGING_URL_PREFIX.length))
  }
  return { text: result, stagedUrls }
}

/**
 * 结算：把 cover / 正文中引用的暂存图片移入 public/uploads 并改写 URL。
 * 保存文章时调用；暂存文件缺失则抛错（前端提示重新上传），避免写出悬空引用。
 */
export async function settleImages<T extends { content: string; cover?: string }>(
  post: T,
  cwd: string = process.cwd()
): Promise<T> {
  const stagingDir = path.join(cwd, 'public', 'cache', 'uploads')
  const uploadDir = path.join(cwd, 'public', 'uploads')

  // cover 是裸 URL（非 markdown 图片语法），单独映射
  const coverIsStaged = !!post.cover && post.cover.startsWith(STAGING_URL_PREFIX)
  const settledCover = coverIsStaged && post.cover
    ? UPLOAD_URL_PREFIX + post.cover.slice(STAGING_URL_PREFIX.length)
    : post.cover
  const bodyRewrite = rewriteStagedRefs(post.content)

  // cover 与正文可能引用同一张暂存图，去重后逐个移动
  const stagedUrls = new Set([
    ...(coverIsStaged && post.cover ? [post.cover] : []),
    ...bodyRewrite.stagedUrls,
  ])

  for (const url of stagedUrls) {
    const rel = url.slice(STAGING_URL_PREFIX.length)
    const src = path.join(stagingDir, rel)
    const dst = path.join(uploadDir, rel)
    await mkdir(path.dirname(dst), { recursive: true })
    await rename(src, dst)
  }

  return {
    ...post,
    cover: settledCover,
    content: bodyRewrite.text,
  }
}

// 清空暂存目录（编辑页进入时 / 保存成功后调用，保证暂存常态为空）
export async function cleanStagingCache(): Promise<void> {
  await rm(path.join(process.cwd(), 'public', 'cache'), { recursive: true, force: true })
}
