import { marked } from 'marked'

/**
 * 将 Markdown 内容转换为 HTML，用于在编辑器中显示
 * 这是一个简化的转换，主要用于预览
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return ''

  // 预处理：修复格式错误的代码块
  // 匹配代码块结束标记 ``` 后面直接跟非换行字符的情况
  // 例如：```- Windows 或 ```***更多***
  let processed = markdown.replace(/```([^\s\n]*)\n([\s\S]*?)\n```(?!\n)/g, (match, lang, code) => {
    // 检查代码块后面是否有内容（在同一行或下一行）
    // 这种情况比较复杂，需要找到 ``` 后面的第一个非换行字符位置
    return match.replace(/```$/, '```\n')
  })

  // 更通用的修复：在代码块结束标记后如果没有换行，添加换行
  processed = processed.replace(/\n```([^\n])/g, '\n```\n$1')

  // 配置 marked 选项
  marked.use({
    breaks: false,
    gfm: true,
  })

  try {
    return marked.parse(processed) as string
  } catch (error) {
    console.error('Markdown to HTML conversion error:', error)
    return markdown
  }
}

/**
 * 将 HTML 转换回 Markdown（简化版本）
 * 注意：这是一个基础实现，可能无法处理所有复杂情况
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return ''

  let markdown = html

  // 标题转换
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')

  // 粗体
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')

  // 斜体
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')

  // 删除线
  markdown = markdown.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~')
  markdown = markdown.replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~')

  // 代码块
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, (match, code) => {
    // 解码 HTML 实体
    const decoded = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
    return `\`\`\`\n${decoded}\n\`\`\``
  })

  // 内联代码
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, (match, code) => {
    const decoded = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
    return `\`${decoded}\``
  })

  // 链接
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')

  // 图片
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')

  // 无序列表
  markdown = markdown.replace(/<ul[^>]*>/gi, '')
  markdown = markdown.replace(/<\/ul>/gi, '\n')
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')

  // 有序列表
  markdown = markdown.replace(/<ol[^>]*>/gi, '')
  markdown = markdown.replace(/<\/ol>/gi, '\n')
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, (match, content, index) => {
    // 简化的序号处理
    return `${index + 1}. ${content}\n`
  })

  // 引用
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match, content) => {
    const lines = content.split('\n').map((line: string) => `> ${line}`).join('\n')
    return `${lines}\n\n`
  })

  // 段落
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gis, '$1\n\n')

  // 换行
  markdown = markdown.replace(/<br[^>]*>/gi, '\n')

  // 清理多余的空行
  markdown = markdown.replace(/\n{3,}/g, '\n\n')

  // 解码剩余的 HTML 实体
  markdown = markdown.replace(/&lt;/g, '<')
  markdown = markdown.replace(/&gt;/g, '>')
  markdown = markdown.replace(/&amp;/g, '&')
  markdown = markdown.replace(/&quot;/g, '"')
  markdown = markdown.replace(/&#39;/g, "'")

  return markdown.trim()
}
