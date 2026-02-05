// 文章元数据
export interface PostMetadata {
  title: string
  date: string
  summary: string
  tags: string[]
  draft: boolean
  cover?: string
  featured: boolean
}

// 文章数据（用于编辑）
export interface PostData extends PostMetadata {
  slug: string
  content: string // MDX 内容（不含 frontmatter）
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// 文章列表项
export interface PostListItem {
  slug: string
  title: string
  date: Date
  summary: string
  tags: string[]
  draft: boolean
  cover?: string
  readingTime: number
}

// 上传的图片
export interface UploadedImage {
  url: string
  filename: string
  width: number
  height: number
}
