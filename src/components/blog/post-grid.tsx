import { PostCard } from './post-card'
import type { Post } from '@/lib/content'

interface PostGridProps {
  posts: Post[]
  showHero?: boolean
}

export function PostGrid({ posts, showHero = true }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">暂无文章</p>
      </div>
    )
  }

  const heroPost = showHero ? posts.find(p => p.featured) || posts[0] : null
  const regularPosts = heroPost
    ? posts.filter(p => p.slug !== heroPost.slug)
    : posts

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {heroPost && (
        <div className="md:col-span-2">
          <PostCard post={heroPost} variant="hero" />
        </div>
      )}
      {regularPosts.slice(0, heroPost ? 5 : 6).map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  )
}
