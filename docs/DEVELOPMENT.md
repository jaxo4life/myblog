# 开发指南

本文档介绍如何参与博客的开发和维护。

## 开发环境

### 必需软件

- Node.js 20+ ([下载](https://nodejs.org/))
- Git ([下载](https://git-scm.com/))
- 代码编辑器（推荐 VS Code）

### 推荐的 VS Code 扩展

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- MDX

### 安装项目依赖

```bash
git clone https://github.com/your-username/myblog.git
cd myblog
npm install
```

## 开发命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build:static` | 构建静态站点 |
| `npm run preview` | 预览构建结果 |
| `npm run lint` | 运行 ESLint 检查 |
| `npm run type-check` | 运行 TypeScript 类型检查 |

## 项目架构

### 目录结构

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # 管理后台（动态路由组，不导出）
│   │   ├── admin/
│   │   │   ├── page.tsx           # 文章列表页
│   │   │   └── edit/[...slug]/    # 编辑文章页
│   │   └── layout.tsx             # 管理后台布局
│   ├── api/                # API 路由（不导出）
│   │   └── admin/
│   │       ├── posts/              # 文章 CRUD API
│   │       ├── upload/             # 图片上传 API
│   │       └── git/publish/        # Git 发布 API
│   ├── blog/
│   │   ├── [...slug]/     # 文章详情页
│   │   ├── page/[page]/   # 博客分页页
│   │   ├── tag/[tag]/     # 标签页
│   │   └── page.tsx       # 博客列表页
│   ├── rss.xml/           # RSS 订阅
│   ├── sitemap.xml/       # 站点地图
│   ├── robots.txt/        # 爬虫配置
│   ├── about/             # 关于页面
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/
│   ├── admin/             # 管理后台组件
│   │   ├── admin-header.tsx        # 管理后台头部
│   │   ├── novel-editor.tsx        # 富文本编辑器
│   │   ├── image-upload.tsx        # 图片上传组件
│   │   └── back-to-top.tsx         # 回到顶部按钮
│   ├── blog/              # 博客组件
│   │   ├── post-card.tsx
│   │   ├── post-grid.tsx
│   │   ├── reading-progress.tsx
│   │   ├── table-of-contents.tsx
│   │   ├── pagination.tsx
│   │   └── prose.tsx
│   ├── layout/            # 布局组件
│   │   ├── site-header.tsx
│   │   └── site-footer.tsx
│   ├── ui/                # UI 组件
│   │   ├── theme-toggle.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   └── switch.tsx
│   └── theme-provider.tsx # 主题提供者
├── lib/
│   ├── admin/             # 管理后台逻辑
│   │   └── posts.ts               # 文章操作
│   ├── content.ts         # 内容获取逻辑
│   ├── mdx-to-html.ts    # MDX ↔ HTML 转换
│   └── utils.ts           # 工具函数
└── styles/
    └── globals.css        # 全局样式
```

### 数据流

```
MDX 文件 (content/posts/)
    ↓
Content Collections (解析)
    ↓
.content-collections/generated/ (生成)
    ↓
src/lib/content.ts (封装)
    ↓
页面组件 (使用)
```

### 管理后台数据流

```
管理界面
    ↓
API 路由 (/api/admin/*)
    ↓
文件系统操作 (content/posts/)
    ↓
Git 操作 (可选)
```

## 添加功能

### 添加新的页面类型

1. 在 `src/app/` 创建新目录和 page.tsx
2. 使用已有的布局组件
3. 从 `@/components` 导入需要的组件

### 添加新的 UI 组件

1. 在 `src/components/ui/` 创建组件文件
2. 使用 Tailwind CSS 类名
3. 导出并供其他组件使用

### 修改样式

- **全局样式**: 编辑 `src/styles/globals.css`
- **主题颜色**: 编辑 CSS 变量
- **Tailwind 配置**: 编辑 `tailwind.config.ts`

## 内容管理

### 使用管理后台（推荐）

访问 `/admin` 进入管理后台：

1. **新建文章**: 点击"新建文章"按钮
   - 标题输入后自动生成 slug (格式: `YYYY/title-slug`)
   - 支持 WYSIWYG 富文本编辑
   - 可上传图片、设置封面、添加标签

2. **编辑文章**: 点击文章的"编辑"按钮
   - 支持 Markdown 和实时预览
   - 修改 slug 需要手动编辑

3. **发布文章**: 点击"发布"按钮
   - 自动执行 `git add`, `git commit`, `git push`
   - 提交消息格式: `更新文章: [标题]`

### 管理后台 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/posts/` | GET | 获取文章列表 |
| `/api/admin/posts/` | POST | 创建新文章 |
| `/api/admin/posts/[slug]/` | GET | 获取单篇文章 |
| `/api/admin/posts/[slug]/` | PUT | 更新文章 |
| `/api/admin/posts/[slug]/` | DELETE | 删除文章 |
| `/api/admin/upload` | POST | 上传图片 |
| `/api/admin/git/publish` | POST | 一键发布到 Git |

### 手动编辑 MDX

在 `content/posts/` 目录下创建 `.mdx` 文件：

### 文章 Frontmatter

```yaml
---
title: '文章标题'
date: 2024-01-15
summary: '文章摘要，用于列表页展示'
tags: ['标签1', '标签2']
draft: false
cover: 'https://example.com/image.jpg'
featured: true
---
```

### MDX 语法

支持标准 Markdown + JSX 组件：

```mdx
## 标题

普通段落

**粗体** 和 *斜体*

- 列表项 1
- 列表项 2

```typescript
const code = "highlighted"
```

<Callout type="info">
这是自定义组件
</Callout>
```

### 图片处理

1. **本地图片**: 放到 `public/` 目录，使用 `/filename.jpg` 引用
2. **外部图片**: 使用完整 URL
3. **封面图**: 在 frontmatter 中设置 `cover` 字段

## 代码规范

### TypeScript

- 使用类型注解
- 避免使用 `any`
- 组件 props 定义接口

### 命名规范

- 组件: PascalCase (`PostCard.tsx`)
- 工具函数: camelCase (`formatDate.ts`)
- 常量: UPPER_SNAKE_CASE
- CSS 类: kebab-case

### Git 提交规范

```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 修改样式
refactor: 代码重构
test: 添加测试
chore: 构建/工具变更
```

## 常见任务

### 更新主题颜色

项目使用终端风格配色，编辑 `src/styles/globals.css`:

```css
:root {
  /* 终端绿 - 主色调 */
  --terminal-green: 120 60% 35%;
  /* 奶油金 - 次要色 */
  --cream-gold: 35 60% 75%;
  /* ... 其他颜色 */
}
```

Tailwind 中使用: `bg-terminal-green`, `text-cream-gold`

### 修改导航菜单

编辑 `src/components/layout/site-header.tsx`:

```typescript
const navigation = [
  { name: '首页', href: '/' },
  { name: '博客', href: '/blog' },
  { name: '关于', href: '/about' },
  // 添加新菜单项
]
```

### 添加社交链接

编辑 `src/components/layout/site-footer.tsx`:

```typescript
const social = [
  { name: 'GitHub', href: 'your-github-url', icon: Github },
  // 添加新链接
]
```

## 调试技巧

### 查看 Content Collections 生成的内容

```bash
cat .content-collections/generated/index.js
```

### 类型检查

```bash
npm run type-check
```

### 构建分析

```bash
npm run build
# 查看输出中的 First Load JS 大小
```

## 性能优化建议

1. **图片优化**: 使用适当尺寸
2. **代码分割**: 使用动态导入
3. **CSS 优化**: 避免内联样式
4. **字体优化**: 使用 `display: swap`
5. **缓存策略**: 合理设置 Cache-Control

## 获取帮助

- 查看项目 [Issues](https://github.com/your-username/myblog/issues)
- 阅读 [Next.js 文档](https://nextjs.org/docs)
- 阅读 [Tailwind CSS 文档](https://tailwindcss.com/docs)
