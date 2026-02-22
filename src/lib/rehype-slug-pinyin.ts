import { headingRank } from 'hast-util-heading-rank'
import { toString } from 'hast-util-to-string'
import { visit } from 'unist-util-visit'
import { Slugger } from './slug'

/**
 * 自定义 rehype 插件：为标题添加 id
 * 使用拼音转换中文，确保与目录链接一致
 */
export default function rehypeSlugPinyin() {
  const slugger = new Slugger()

  return function (tree: any) {
    slugger.reset()

    visit(tree, 'element', function (node) {
      if (headingRank(node) && !node.properties.id) {
        const text = toString(node)
        node.properties.id = slugger.slug(text)
      }
    })
  }
}
