'use client'

import { useEffect, useRef, useState } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  const scrollRef = useRef<number>(0)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight - windowHeight
      const scrolled = window.scrollY
      const progress = Math.min((scrolled / documentHeight) * 100, 100)

      // 使用 requestAnimationFrame 优化性能
      if (Math.abs(progress - scrollRef.current) > 1) {
        scrollRef.current = progress
        setProgress(progress)
      }
    }

    // 使用被动监听器提升性能
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="reading-progress-container">
      <div
        className="reading-progress-bar"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
