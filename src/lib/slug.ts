import { pinyin } from 'pinyin-pro'

/**
 * 生成标题的 slug ID
 * 中文转拼音，英文保留，确保与目录链接一致
 */
export function generateHeadingSlug(text: string): string {
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

  return idPart.replace(/-+/g, '-').replace(/^-+|-+$/g, '')
}

/**
 * 用于跟踪已使用的 slug，确保唯一性
 */
export class Slugger {
  private usedSlugs = new Set<string>()

  reset(): void {
    this.usedSlugs.clear()
  }

  slug(text: string): string {
    const baseSlug = generateHeadingSlug(text)

    // 如果 slug 为空，使用默认值
    if (!baseSlug) {
      const defaultSlug = `heading-${this.usedSlugs.size + 1}`
      this.usedSlugs.add(defaultSlug)
      return defaultSlug
    }

    // 确保唯一性
    let slug = baseSlug
    let counter = 1
    while (this.usedSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    this.usedSlugs.add(slug)
    return slug
  }
}
