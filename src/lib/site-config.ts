/**
 * 站点级配置的单一事实来源。
 * 所有需要站点 URL / 名称 / 描述的地方都从这里取，避免散落不一致。
 *
 * 部署时通过环境变量 NEXT_PUBLIC_SITE_URL 覆盖域名即可全站生效。
 */
export const siteConfig = {
  /** 站点完整 URL（无尾斜杠） */
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.jaxoo.xyz',
  /** 站点名称 */
  name: "jaxo's view",
  /** 站点描述 */
  description: '分享技术、思考和生活的个人博客',
  /** 语言区域 */
  locale: 'zh_CN',
  /** 默认 OG / 社交分享图 */
  ogImage: '/logo.png',
} as const
