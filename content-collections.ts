import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'
import { z } from 'zod'
import rehypeShiki from '@shikijs/rehype'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkGfm from 'remark-gfm'
import rehypeSlugPinyin from './src/lib/rehype-slug-pinyin'
import { Slugger } from './src/lib/slug'

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
        rehypeSlugPinyin,
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

    // 使用共享的 Slugger 确保与 rehype 插件生成的 ID 一致
    const slugger = new Slugger()

    const headingRegex = /^#{1,3}\s+(.+)$/gm
    let match
    while ((match = headingRegex.exec(document.content)) !== null) {
      const level = match[0].match(/^#+/)?.[0].length || 2
      const text = match[1].trim()

      // 使用共享的 slug 生成器
      const id = slugger.slug(text)

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
