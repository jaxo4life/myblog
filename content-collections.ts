import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'
import { z } from 'zod'
import { pinyin } from 'pinyin-pro'
import rehypeShiki from '@shikijs/rehype'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

const posts = defineCollection({
  name: 'Post',
  directory: 'content/posts',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    cover: z.string().optional(),
    featured: z.boolean().default(false),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeShiki,
          {
            theme: {
              light: 'github-light',
              dark: 'github-dark',
            },
            transformers: [
              {
                code(node: any) {
                  node.properties = node.properties || {}
                  node.properties.className = ['shiki']
                },
              },
            ],
          },
        ],
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'wrap',
            properties: {
              className: ['anchor-link'],
            },
          },
        ],
      ],
    })

    const headings: Array<{
      id: string
      text: string
      level: number
    }> = []

    // 用于跟踪已使用的 id，确保唯一性
    const usedIds = new Set<string>()

    const headingRegex = /^#{1,3}\s+(.+)$/gm
    let match
    while ((match = headingRegex.exec(document.content)) !== null) {
      const level = match[0].match(/^#+/)?.[0].length || 2
      const text = match[1].trim()
      // 移除 markdown 格式符号
      const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`/g, '')
        .replace(/\[[^\]]+\]/g, '')

      // 生成 id：中文转拼音，英文保留
      let idPart = ''
      for (const char of cleanText) {
        if (/[\u4e00-\u9fa5]/.test(char)) {
          // 中文转拼音
          idPart += pinyin(char, { toneType: 'none' })
        } else if (/[a-zA-Z0-9]/.test(char)) {
          // 英文/数字保留
          idPart += char.toLowerCase()
        } else if (/\s/.test(char)) {
          // 空格转为连字符
          if (idPart && !idPart.endsWith('-')) {
            idPart += '-'
          }
        }
      }

      let id = idPart.replace(/-+/g, '-').replace(/^-+|-+$/g, '')

      // 如果 id 为空或已存在，添加序号后缀
      if (!id) {
        id = `heading-${headings.length + 1}`
      } else {
        let counter = 1
        let uniqueId = id
        while (usedIds.has(uniqueId)) {
          uniqueId = `${id}-${counter}`
          counter++
        }
        id = uniqueId
      }

      usedIds.add(id)
      headings.push({ id, text, level })
    }

    const wordsPerMinute = 200
    const words = document.content.split(/\s+/).length
    const readingTime = Math.ceil(words / wordsPerMinute)

    return {
      ...document,
      mdx,
      slug: document._meta.path.replace(/\.mdx$/, '').replace(/\\/g, '/'),
      readingTime,
      headings,
    }
  },
})

export default defineConfig({
  collections: [posts],
})
