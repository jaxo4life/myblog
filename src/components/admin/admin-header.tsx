import Link from 'next/link'
import { Home, FileText } from 'lucide-react'

export default function AdminHeader() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-6 px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Home className="h-5 w-5" />
          <span>返回博客</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-secondary transition-colors"
          >
            <FileText className="h-4 w-4" />
            文章管理
          </Link>
        </nav>
      </div>
    </header>
  )
}
