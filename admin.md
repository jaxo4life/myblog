# 博客管理后台设计文档

## 概述

内置的博客管理后台，支持在线编辑文章、图片上传和一键发布到 Git。

## 技术选型

| 技术 | 用途 |
|------|------|
| Novel (TipTap) | Notion 风格富文本编辑器 |
| 本地文件系统 | MDX 文件存储 |
| Sharp | 图片压缩处理 |
| Next.js 15 App Router | 路由和 API |

## 目录结构

```
src/
├── app/
│   ├── (admin)/                          # 管理后台路由组（不导出）
│   │   ├── layout.tsx                    # 管理后台布局
│   │   └── admin/
│   │       ├── page.tsx                  # 文章列表页
│   │       └── edit/
│   │           └── [...slug]/            # 捕获所有路由
│   │               └── page.tsx          # 编辑/新建文章页
│   │
│   └── api/                              # API 路由（不导出）
│       └── admin/
│           ├── posts/
│           │   ├── route.ts              # GET(列表), POST(创建)
│           │   └── [...slug]/
│           │       └── route.ts          # GET, PUT, DELETE
│           ├── upload/
│           │   └── route.ts              # POST(图片上传)
│           └── git/
│               └── publish/
│                   └── route.ts          # POST(git commit+push)
│
├── components/
│   └── admin/                            # 管理后台组件
│       ├── admin-header.tsx              # 顶部导航栏
│       ├── novel-editor.tsx              # Novel 编辑器封装
│       ├── image-upload.tsx              # 图片上传组件
│       └── back-to-top.tsx               # 回到顶部按钮
│
├── lib/
│   ├── admin/
│   │   └── posts.ts                      # 文章 CRUD 操作
│   ├── mdx-to-html.ts                    # MDX ↔ HTML 转换
│   └── utils.ts                          # 工具函数
│
└── types/
    └── admin.ts                          # 类型定义

public/
└── uploads/                              # 上传的图片
    └── {year}/
        └── {month}/
            └── {filename}.jpg
```

## 路由设计

### 页面路由

| 路由 | 功能 |
|------|------|
| `/admin` | 文章列表仪表盘 |
| `/admin/edit/new` | 新建文章 |
| `/admin/edit/{slug}` | 编辑文章 |

### API 路由

| API | 方法 | 功能 |
|-----|------|------|
| `/api/admin/posts` | GET | 获取文章列表 |
| `/api/admin/posts` | POST | 创建新文章 |
| `/api/admin/posts/{slug}` | GET | 获取文章详情 |
| `/api/admin/posts/{slug}` | PUT | 更新文章 |
| `/api/admin/posts/{slug}` | DELETE | 删除文章 |
| `/api/admin/upload` | POST | 上传图片 |
| `/api/admin/git/publish` | POST | 一键发布到 Git |

## 核心功能

### 1. 文章编辑

- **富文本编辑**: Novel 编辑器，支持 Markdown 快捷键
- **代码块**: Shiki 语法高亮
- **图片上传**: 拖拽或粘贴上传
- **实时预览**: 所见即所得

### 2. Slug 自动生成

新建文章时，根据标题自动生成 slug：
- 格式: `{year}/{kebab-title}`
- 用户手动编辑后停止自动更新

```typescript
function generateSlugFromTitle(title: string): string {
  const currentYear = new Date().getFullYear()
  const kebabTitle = title
    .toLowerCase()
    .replace(/[\s\W_]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${currentYear}/${kebabTitle}`
}
```

### 3. 一键发布

点击"发布"按钮自动执行：
1. `git add content/posts/`
2. `git commit -m "message"`
3. `git push`

### 4. 响应式设计

- **桌面端**: 表格布局，完整操作栏
- **移动端**: 卡片布局，标签切换

## 文章元数据 (Frontmatter)

```yaml
---
title: '文章标题'
date: 2025-01-15
summary: '文章摘要'
tags: ['标签1', '标签2']
draft: false
cover: '/uploads/2025/01/image.jpg'
featured: false
---
```

## UI 组件

### 终端窗口样式

```tsx
<div className="terminal-window">
  <div className="terminal-header">
    <span>filename.json</span>
  </div>
  <div className="terminal-body">
    {/* 内容 */}
  </div>
</div>
```

### 按钮样式

- `btn-terminal`: 主按钮（终端绿）
- `btn-terminal-outline`: 次要按钮（边框样式）

## 安全注意事项

⚠️ **重要**: 管理后台仅用于本地开发

- 使用 `(admin)` 路由组，静态构建时排除
- API 路由仅在开发环境可用
- 如需部署，添加身份验证（密码/OAuth）

## 依赖包

```bash
# 编辑器
npm install @novel-js/react novel

# 图片处理
npm install sharp

# MDX 解析
npm install gray-matter
```
