/**
 * 将 Tiptap 编辑器的 HTML 输出转换为 MDX 格式
 */

export function htmlToMdx(html: string): string {
  let mdx = html

  // 标题转换
  mdx = mdx.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
  mdx = mdx.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
  mdx = mdx.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
  mdx = mdx.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')

  // 粗体
  mdx = mdx.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
  mdx = mdx.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')

  // 斜体
  mdx = mdx.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
  mdx = mdx.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')

  // 删除线
  mdx = mdx.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~')
  mdx = mdx.replace(/<strike[^>]*>(.*?)<\/strike>/gi, '~~$1~~')

  // 行内代码
  mdx = mdx.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')

  // 代码块
  mdx = mdx.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, (match: string, code: string) => {
    const cleanCode = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
    return `\`\`\`\n${cleanCode}\n\`\`\`\n\n`
  })

  // 链接
  mdx = mdx.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')

  // 图片
  mdx = mdx.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
  mdx = mdx.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')

  // 引用块
  mdx = mdx.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match: string, content: string) => {
    const cleanContent = content
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '')
      .replace(/\n\n/g, '\n')
      .trim()
    return `> ${cleanContent}\n\n`
  })

  // 无序列表
  mdx = mdx.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match: string, content: string) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gis) || []
    const list = items.map((item: string) => {
      const text = item.replace(/<\/?li[^>]*>/gi, '').trim()
      return `- ${text}`
    }).join('\n')
    return `${list}\n\n`
  })

  // 有序列表
  mdx = mdx.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match: string, content: string) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gis) || []
    let index = 1
    const list = items.map((item: string) => {
      const text = item.replace(/<\/?li[^>]*>/gi, '').trim()
      return `${index++}. ${text}`
    }).join('\n')
    return `${list}\n\n`
  })

  // 段落
  mdx = mdx.replace(/<p[^>]*>(.*?)<\/p>/gis, (match: string, content: string) => {
    // 如果段落只包含空白，返回空行
    if (!content.trim() || /^(\s|<br\s*\/?>)+$/i.test(content)) {
      return '\n\n'
    }
    return `${content}\n\n`
  })

  // 换行
  mdx = mdx.replace(/<br\s*\/?>/gi, '\n')

  // 清理多余的空行
  mdx = mdx.replace(/\n{3,}/g, '\n\n')

  // 清理 HTML 实体
  mdx = mdx.replace(/&nbsp;/g, ' ')
  mdx = mdx.replace(/&lt;/g, '<')
  mdx = mdx.replace(/&gt;/g, '>')
  mdx = mdx.replace(/&amp;/g, '&')
  mdx = mdx.replace(/&quot;/g, '"')
  mdx = mdx.replace(/&#39;/g, "'")

  return mdx.trim()
}

/**
 * 将 MDX 转换回 HTML（用于编辑器加载）
 */
export function mdxToHtml(mdx: string): string {
  if (!mdx) return ''

  let html = mdx

  // 代码块 - 必须先处理，避免内部内容被替换
  // 支持格式：```lang\ncode\n``` 和 ```lang\ncode\n```\n
  html = html.replace(/```(\w*)\n([\s\S]*?)\n```(\n|$)/g, (match, lang, code, trailing) => {
    // 转义 HTML 特殊字符
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    return `<pre><code class="language-${lang}">${escapedCode}</code></pre>${trailing}`
  })

  // 标题
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // 粗体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // 斜体
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // 删除线
  html = html.replace(/~~(.+?)~~/g, '<s>$1</s>')

  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // 图片
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')

  // 引用块 - 处理多行引用
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
  // 合并连续的引用块
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n')

  // 无序列表
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  // 移除列表项之间的换行标签
  html = html.replace(/<\/li>\n<li>/g, '</li>\n<li>')
  // 包裹列表项
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)

  // 有序列表
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ol>${match}</ol>`)

  // 段落 - 处理非标签开头的行
  const lines = html.split('\n')
  const result = []
  let inList = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // 跳过已有标签
    if (line.startsWith('<')) {
      result.push(line)
      inList = !line.includes('</ul>') && !line.includes('</ol>')
      continue
    }

    // 空行
    if (!line.trim()) {
      result.push('')
      continue
    }

    // 如果不在列表中，普通文本包装在 p 标签中
    if (!inList && line.trim()) {
      result.push(`<p>${line}</p>`)
    } else {
      result.push(line)
    }
  }

  return result.join('\n')
}
