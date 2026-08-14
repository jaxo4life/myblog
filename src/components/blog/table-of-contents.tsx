'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  headings: Heading[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  // 支持 h2（顶格）和 h3（缩进）两级，呈现真实文章结构
  const tocItems = headings.filter((h) => h.level === 2 || h.level === 3)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-100px 0% -80% 0%',
        threshold: 0,
      }
    )

    tocItems.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [tocItems])

  if (tocItems.length === 0) return null

  return (
    <nav className="hidden lg:block" aria-label="目录">
      <div className="sticky top-20">
        <h4 className="text-sm font-semibold text-foreground mb-4">目录</h4>
        <ul className="space-y-1 border-l border-border">
          {tocItems.map(({ id, text, level }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={cn(
                  'toc-link',
                  activeId === id && 'active',
                  level === 3 && 'pl-7 text-xs'
                )}
                onClick={(e) => {
                  e.preventDefault()
                  const element = document.getElementById(id)
                  if (element) {
                    const offset = 80
                    const top = element.getBoundingClientRect().top + window.scrollY - offset
                    window.scrollTo({ top, behavior: 'smooth' })
                  }
                }}
              >
                {text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
