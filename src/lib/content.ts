/**
 * 内容集合生成的类型
 * 这个文件会在 content-collections build 后自动生成
 */

import type { Post } from '~content'
import { allPosts } from '~content'

// 为了解决 webpack 别名问题，这里定义类型
export type { Post }

// 重新导出 Post 类型供其他组件使用
export type { Post as GeneratedPost } from '~content'

// 获取所有已发布的文章
export function getPublishedPosts(): Post[] {
  return allPosts
    .filter((post: Post) => !post.draft)
    .sort((a: Post, b: Post) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// 获取特色文章
export function getFeaturedPosts(): Post[] {
  return getPublishedPosts().filter(post => post.featured)
}

// 根据 slug 获取文章
export function getPostBySlug(slug: string): Post | undefined {
  return allPosts.find(post => post.slug === slug && !post.draft)
}

// 获取所有标签
export function getAllTags(): string[] {
  const posts = getPublishedPosts()
  const tags = new Set<string>()
  posts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
}

// 根据标签获取文章
export function getPostsByTag(tag: string): Post[] {
  return getPublishedPosts().filter(post =>
    post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  )
}

// 分页获取文章
export function getPaginatedPosts(page: number = 1, perPage: number = 9) {
  const posts = getPublishedPosts()
  const totalPosts = posts.length
  const totalPages = Math.ceil(totalPosts / perPage)
  const currentPage = Math.max(1, Math.min(page, totalPages))
  const startIndex = (currentPage - 1) * perPage
  const endIndex = startIndex + perPage

  return {
    posts: posts.slice(startIndex, endIndex),
    pagination: {
      currentPage,
      totalPages,
      totalPosts,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    },
  }
}
