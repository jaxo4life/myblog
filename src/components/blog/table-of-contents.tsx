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
  const h2Headings = headings.filter((h) => h.level === 2)

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

    h2Headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [h2Headings])

  if (h2Headings.length === 0) return null

  return (
    <nav className="hidden lg:block" aria-label="目录">
      <div className="sticky top-20">
        <h4 className="text-sm font-semibold text-foreground mb-4">
          目录
        </h4>
        <ul className="space-y-1 border-l border-border">
          {h2Headings.map(({ id, text }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={cn(
                  'toc-link',
                  activeId === id && 'active'
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
