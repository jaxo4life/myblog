<div align="center">

# 数字花园

### 基于 Next.js 15 的复古终端风格个人博客

[![Next.js](https://img.shields.io/badge/Next.js-15.1+-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

一个现代化的个人博客系统，采用复古终端风格设计，支持在线内容管理和一键发布到 Git。

[快速开始](#快速开始) • [功能特性](#功能特性) • [AI 复刻](#-ai-复刻提示词) • [部署](#部署)

</div>

---

## 功能特性

### 内容管理
- 📝 **在线编辑** - 内置管理后台，支持 WYSIWYG 编辑
- 🚀 **一键发布** - 保存后自动 git commit & push
- 🏷️ **标签系统** - 文章分类和筛选
- 📄 **草稿功能** - 支持草稿保存，随时继续编辑
- ⭐ **精选文章** - 标记重要内容

### 用户体验
- 🎮 **终端风格** - 复古计算机美学设计
- 🌓 **主题切换** - 支持亮色/暗色模式
- 📱 **响应式设计** - 完美适配各种设备
- ⌨️ **代码高亮** - Shiki 语法高亮
- 📖 **阅读体验** - 自动目录、阅读进度条

### 技术特性
- ⚡ **静态导出** - 纯 HTML/CSS/JS，无服务器依赖
- 🔍 **SEO 友好** - 自动生成 Sitemap 和 RSS
- 📦 **CDN 就绪** - 适合 Cloudflare Pages、Vercel 等平台

## 技术栈

| 技术 | 版本 | 用途 |
|:------|:------|:------|
| ![Next.js](https://img.shields.io/badge/Next.js-15.1+-black?style=flat-square&logo=next.js) | 15.1+ | React 框架 |
| ![React](https://img.shields.io/badge/React-19.0+-blue?style=flat-square&logo=react) | 19.0+ | UI 库 |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue?style=flat-square&logo=typescript) | 5.7+ | 类型安全 |
| ![Tailwind](https://img.shields.io/badge/Tailwind-3.4+-38bdf8?style=flat-square&logo=tailwind-css) | 3.4+ | 样式框架 |
| Content Collections | 0.13+ | 内容管理 |
| MDX | - | Markdown + JSX |
| Shiki | 1.24+ | 代码高亮 |
| TipTap | 2.27+ | 富文本编辑器 |

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 本地开发

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看博客首页。

### 3. 访问管理后台

访问 [http://localhost:3000/admin](http://localhost:3000/admin) 进入管理后台。

## 项目结构

```
myblog/
├── content/posts/          # 博客文章（MDX）
│   ├── 2023/
│   ├── 2024/
│   └── 2025/
├── public/
│   └── uploads/           # 上传的图片
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (admin)/       # 管理后台（动态路由）
│   │   ├── api/           # API 路由
│   │   ├── blog/          # 博客页面
│   │   ├── about/         # 关于页面
│   │   ├── page.tsx       # 首页
│   │   └── layout.tsx     # 根布局
│   ├── components/        # React 组件
│   │   ├── admin/         # 管理后台组件
│   │   ├── blog/          # 博客组件
│   │   ├── layout/        # 布局组件
│   │   └── ui/            # UI 组件
│   ├── lib/               # 工具函数
│   └── styles/            # 样式文件
├── scripts/               # 工具脚本
└── content-collections.ts # 内容配置
```

## 内容管理

### 在线编辑（推荐）

1. 访问 `/admin` 进入管理后台
2. 点击"新建文章"创建新文章
3. 填写标题、内容、标签等信息
4. 点击"保存"保存为草稿
5. 点击"发布"按钮一键推送到 Git

### 手动创建 MDX

在 `content/posts/` 目录下创建 `.mdx` 文件：

```mdx
---
title: '文章标题'
date: 2025-01-15
summary: '文章摘要'
tags: ['标签1', '标签2']
draft: false
featured: false
cover: ''
---

# 开始写作

使用 Markdown 或 MDX 语法...
```

### Frontmatter 字段

| 字段 | 类型 | 必填 | 说明 |
|:-----|:------|:------|:------|
| title | string | ✅ | 文章标题 |
| date | string | ✅ | 发布日期 (YYYY-MM-DD) |
| summary | string | ✅ | 文章摘要 |
| tags | string[] | ❌ | 标签数组 |
| draft | boolean | ❌ | 是否为草稿 (默认 true) |
| featured | boolean | ❌ | 是否为特色文章 |
| cover | string | ❌ | 封面图 URL |

## 部署

### Cloudflare Pages

1. 连接 GitHub 仓库到 Cloudflare Pages
2. 配置构建设置：

```
构建命令: npm run build:static
构建输出目录: out
Node.js 版本: 20
环境变量: STATIC_BUILD=true
```

3. 推送代码自动触发构建

### Vercel

1. 连接 GitHub 仓库
2. 配置构建设置：

```
构建命令: npm run build:static
输出目录: out
```

## 常用命令

```bash
# 本地开发
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 构建静态站点
npm run build:static

# 预览构建结果
npm run preview
```

## 主题定制

编辑 `src/styles/globals.css` 中的 CSS 变量：

```css
:root {
  /* 终端绿 */
  --terminal-green: 120 60% 35%;
  /* 奶油金 */
  --cream-gold: 35 60% 75%;
  /* ... */
}
```

## 开发指南

### 添加新页面

在 `src/app/` 目录下创建 `page.tsx`：

```typescript
export default function NewPage() {
  return <div>新页面</div>
}
```

### 添加新组件

在 `src/components/` 目录下创建组件：

```typescript
export function MyComponent() {
  return <div>我的组件</div>
}
```

---

## 🤖 AI 复刻提示词

<details>
<summary>点击展开：用 Claude Code 生成类似项目的 Prompt</summary>

如果你想用 AI（如 Claude Code）生成一个类似的博客系统，可以直接使用以下 prompt：

```
请帮我创建一个基于 Next.js 15 的个人博客系统，要求如下：

## 核心特性
1. 复古终端风格设计（类似老式计算机界面）
2. 支持 MDX 格式的文章，存放在 content/posts/ 目录
3. 使用 Content Collections 管理内容（构建时生成）
4. 内置管理后台 /admin，支持在线编辑和一键发布（git commit + push）
5. 静态导出支持，可部署到 Cloudflare Pages / Vercel
6. 响应式设计，完美适配移动端

## 技术栈
- Next.js 15.1+ (App Router)
- React 19.0+
- TypeScript 5.7+
- Tailwind CSS 3.4+ (使用 @tailwindcss/typography)
- Content Collections 0.13+ (内容管理)
- MDX (Markdown + JSX)
- Shiki 1.24+ (代码高亮，使用 @shikijs/rehype)
- TipTap/Novel (富文本编辑器)

## 内容结构
文章使用 MDX 格式，frontmatter 包含：
- title (string, 必填)
- date (string, 必填, YYYY-MM-DD)
- summary (string, 必填)
- tags (string[], 可选)
- draft (boolean, 可选, 默认 true)
- featured (boolean, 可选, 默认 false)
- cover (string, 可选)

## 设计风格
- 终端绿主色调：hsl(120 60% 35%) 浅色模式，hsl(120 85% 60%) 深色模式
- 奶油金辅助色：hsl(35 60% 75%)
- 米白背景（浅色）/ 深黑背景（深色）
- 等宽字体风格的标签显示：[tag-name]
- 终端窗口样式组件（带红黄绿三个点的标题栏）
- 扫描线效果和网格背景

## 页面结构
- 首页 /：Hero 区域（终端风格欢迎语）+ 特色文章 + 最新文章 + 热门标签
- 博客列表 /blog：卡片网格布局，支持分页
- 文章详情 /blog/[...slug]：MDX 渲染，目录导航，阅读进度条
- 标签页 /blog/tag/[tag] 和标签列表 /tags
- 管理后台 /admin：文章列表（表格/卡片），新建/编辑/删除功能
- 编辑器 /admin/edit/[...slug]：使用 TipTap/Novel 的 WYSIWYG 编辑器
- 关于页面 /about

## API 路由
- GET/POST /api/admin/posts - 获取/创建文章
- PUT/DELETE /api/admin/posts/[...slug] - 更新/删除文章
- POST /api/admin/upload - 图片上传
- POST /api/admin/git/publish - 一键发布到 Git

## 关键配置
1. content-collections.ts：定义文章集合，配置 MDX 编译（Shiki 高亮、自动锚点）
2. next.config.ts：支持静态导出（output: 'export'），配置 Content Collections
3. tailwind.config.ts：扩展主题色，配置 typography 插件
4. src/lib/content.ts：内容获取函数（getPublishedPosts、getPostBySlug、getAllTags 等）

## 构建脚本
- dev：本地开发
- build：标准构建
- build:static：静态导出（设置 STATIC_BUILD=true 环境变量）
- preview：构建并预览静态站点

请按照以上规格生成完整的项目结构和代码，确保移动端适配良好，代码块不溢出。
```

</details>

---

## 更新日志

### v0.2.0 (2025-02)
- ✨ 添加管理后台，支持在线编辑文章
- ✨ 实现一键发布功能（git commit + push）
- 🎨 重新设计为复古终端风格
- 📱 优化移动端体验
- 🔧 修复代码块移动端溢出问题

### v0.1.0 (2024)
- 🎉 初始版本，从 xlog 迁移内容

## 许可证

[MIT](LICENSE)
