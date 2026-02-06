import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { BackToTop } from '@/components/layout/back-to-top'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  title: {
    default: "jaxo's view",
    template: "%s | jaxo's view",
  },
  description: '分享技术、思考和生活的个人博客',
  keywords: ['博客', '技术', '编程', '思考'],
  authors: [{ name: 'jaxo' }],
  creator: 'jaxo',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: '/',
    siteName: "jaxo's view",
    title: "jaxo's view",
    description: '分享技术、思考和生活的个人博客',
  },
  twitter: {
    card: 'summary_large_image',
    title: "jaxo's view",
    description: '分享技术、思考和生活的个人博客',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  )
}
