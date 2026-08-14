import { getPublishedPosts } from '@/lib/content'
import { siteConfig } from '@/lib/site-config'

export const dynamic = 'force-static'

export async function GET() {
  const siteUrl = siteConfig.url

  const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
