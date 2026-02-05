import { readFile, writeFile, readdir, unlink, mkdir } from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { PostData, PostMetadata, PostListItem } from '@/types/admin'

const CONTENT_DIR = path.join(process.cwd(), 'content/posts')

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
          const wordsPerMinute = 200
          const words = content.split(/\s+/).length
          const readingTime = Math.ceil(words / wordsPerMinute)

          posts.push({
            slug,
            title: (data.title as string) || slug,
            date: new Date(data.date as string),
            summary: (data.summary as string) || '',
            tags: (data.tags as string[]) || [],
            draft: (data.draft as boolean) || false,
            cover: data.cover as string | undefined,
            readingTime,
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
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)

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
  // 确保父目录存在
  const filePath = path.join(CONTENT_DIR, `${post.slug}.mdx`)
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

// 删除文章
export async function deletePost(slug: string): Promise<void> {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
  await unlink(filePath)
}
