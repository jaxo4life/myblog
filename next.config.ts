import type { NextConfig } from 'next'
import { withContentCollections } from '@content-collections/next'
import path from 'path'

// 检查是否为静态构建
const isStaticBuild = process.env.STATIC_BUILD === 'true'

const config: NextConfig = {
  // 静态构建时启用导出模式
  output: isStaticBuild ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  transpilePackages: ['@content-collections/next'],
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '~content': path.resolve(__dirname, '.content-collections/generated'),
    }
    return config
  },
}

export default withContentCollections(config)
