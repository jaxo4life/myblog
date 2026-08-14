import { readFile, writeFile, readdir, unlink, mkdir } from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { PostData, PostMetadata, PostListItem } from '@/types/admin'

const CONTENT_DIR = path.join(process.cwd(), 'content/posts')

// slug 白名单：字母、数字、中文、连字符、下划线、斜杠（年份目录用）；禁止前导斜杠，杜绝绝对路径
const SAFE_SLUG_RE = /^[一-龥a-zA-Z0-9][一-龥a-zA-Z0-9/_-]*$/

/**
 * 安全解析文章文件路径，杜绝路径穿越。
 * - slug 必须匹配白名单（拦截 `..`、绝对路径等）
 * - resolve 后必须仍位于 CONTENT_DIR 内（兜底）
 */
export function resolvePostFile(slug: string): string {
  if (!slug || !SAFE_SLUG_RE.test(slug)) {
    throw new Error('非法的 slug')
  }
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
  const resolved = path.resolve(filePath)
  const base = path.resolve(CONTENT_DIR)
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    throw new Error('非法的文章路径')
  }
  return resolved
}

// 中文阅读时长：reading-time 库默认会按 CJK 字符计数，wordsPerMinute 按中文阅读速度调校
function calcReadingTime(content: string): number {
  try {
    return Math.max(1, Math.ceil(readingTime(content, { wordsPerMinute: 350 }).minutes))
  } catch {
    return 1
  }
}

// 确保目录存在
async function ensureDir(dir: string) {
  try {
    await mkdir(dir, { recursive: true })
  } catch {
    // 目录已存在
  }
}

// 获取所有文章列表
export async function getPostList(): Promise<PostListItem[]> {
  const posts: PostListItem[] = []

  try {
    // 递归读取所有 MDX 文件
    async function readDirRecursively(dir: string, baseDir: string = dir) {
      const entries = await readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const relativePath = path.relative(baseDir, fullPath)

        if (entry.isDirectory()) {
          await readDirRecursively(fullPath, baseDir)
        } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
          const content = await readFile(fullPath, 'utf-8')
          const { data } = matter(content)

          const slug = relativePath.replace(/\.mdx$/, '').replace(/\\/g, '/')

          posts.push({
            slug,
            title: (data.title as string) || slug,
            date: new Date(data.date as string),
            summary: (data.summary as string) || '',
            tags: (data.tags as string[]) || [],
            draft: (data.draft as boolean) || false,
            cover: data.cover as string | undefined,
            readingTime: calcReadingTime(content),
          })
        }
      }
    }

    await readDirRecursively(CONTENT_DIR)
  } catch (error) {
    console.error('Error reading posts:', error)
  }

  return posts.sort((a, b) => b.date.getTime() - a.date.getTime())
}

// 获取文章详情
export async function getPost(slug: string): Promise<PostData | null> {
  let filePath: string
  try {
    filePath = resolvePostFile(slug)
  } catch {
    return null
  }

  try {
    const content = await readFile(filePath, 'utf-8')
    const { data, content: mdxContent } = matter(content)

    return {
      slug,
      title: (data.title as string) || '',
      date: (data.date as string) || new Date().toISOString().split('T')[0],
      summary: (data.summary as string) || '',
      tags: (data.tags as string[]) || [],
      draft: (data.draft as boolean) || false,
      cover: data.cover as string | undefined,
      featured: (data.featured as boolean) || false,
      content: mdxContent,
    }
  } catch {
    return null
  }
}

// 创建新文章
export async function createPost(post: PostData): Promise<void> {
  const filePath = resolvePostFile(post.slug)
  const dir = path.dirname(filePath)
  await mkdir(dir, { recursive: true })

  const frontmatter: PostMetadata = {
    title: post.title,
    date: post.date,
    summary: post.summary,
    tags: post.tags,
    draft: post.draft,
    cover: post.cover,
    featured: post.featured,
  }

  const content = matter.stringify(post.content, frontmatter)
  await writeFile(filePath, content, 'utf-8')
}

// 更新文章
export async function updatePost(slug: string, post: PostData): Promise<void> {
  // 如果 slug 变了，删除旧文件
  if (slug !== post.slug) {
    await deletePost(slug)
  }

  await createPost(post)
}

// 提取一篇文章引用的本地上传图片 URL（cover + markdown 图片），用于孤儿图片清理
export function extractImageUrls(content: string, cover?: string): string[] {
  const urls = new Set<string>()
  if (cover && cover.startsWith('/uploads/')) urls.add(cover)
  for (const m of content.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) {
    if (m[1].startsWith('/uploads/')) urls.add(m[1])
  }
  return Array.from(urls)
}

// 安全删除一张上传图片（仅限 public/uploads 内，防路径穿越）
async function deleteUploadImage(url: string): Promise<void> {
  if (!url.startsWith('/uploads/')) return
  const resolved = path.resolve(process.cwd(), 'public', url)
  const base = path.resolve(process.cwd(), 'public/uploads')
  if (!resolved.startsWith(base + path.sep)) return
  try {
    await unlink(resolved)
  } catch {
    // 文件不存在或已删除
  }
}

// 收集所有文章（除 excludeSlug）引用的上传图片，用于判断图片是否还被其他文章使用
async function collectReferencedImages(excludeSlug: string): Promise<Set<string>> {
  const referenced = new Set<string>()
  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
      } else if (entry.name.endsWith('.mdx')) {
        const raw = await readFile(full, 'utf-8')
        const { data, content: body } = matter(raw)
        const rel = path.relative(CONTENT_DIR, full).replace(/\.mdx$/, '').replace(/\\/g, '/')
        if (rel === excludeSlug) continue
        extractImageUrls(body, data.cover as string | undefined).forEach((u) => referenced.add(u))
      }
    }
  }
  await walk(CONTENT_DIR)
  return referenced
}

// 删除文章：删 .mdx + 清理「仅被本文章引用」的孤儿图片
export async function deletePost(slug: string): Promise<void> {
  const filePath = resolvePostFile(slug)

  // 1. 先读文章，提取其引用的图片
  let targetImages: string[] = []
  try {
    const raw = await readFile(filePath, 'utf-8')
    const { data, content: body } = matter(raw)
    targetImages = extractImageUrls(body, data.cover as string | undefined)
  } catch {
    // 读不到则跳过图片清理
  }

  // 2. 删除 .mdx
  await unlink(filePath)

  // 3. 清理孤儿图片：仅删「其他文章不再引用」的，避免误删共享图
  //    扫描失败则保守跳过（宁可留孤儿图，不可误删在用的图）
  if (targetImages.length > 0) {
    try {
      const stillReferenced = await collectReferencedImages(slug)
      for (const url of targetImages) {
        if (!stillReferenced.has(url)) {
          await deleteUploadImage(url)
        }
      }
    } catch {
      // 扫描失败，保守不清理
    }
  }
}
