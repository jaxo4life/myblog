# 博客管理后台设计文档

## 概述

内置的博客管理后台，支持 Markdown 在线编辑（实时预览）、图片上传和一键发布到 Git。
仅在本地开发模式（`npm run dev`）可用，静态构建时自动排除。

## 运行模型

- **本地写作**：`npm run dev` 启动开发服务器，访问 `/admin`。content-collections 监听文件变化，保存后前台实时刷新。
- **静态发布**：`npm run build:static` 导出纯静态站点（admin / api 被移除），部署到 CDN。
- **同步 GitHub**：后台「发布」按钮 → `git add content/posts/ public/uploads/` → commit → push → 远程 CI 自动构建部署。

## 技术选型

| 技术 | 用途 |
|------|------|
| react-markdown + remark-gfm | Markdown 编辑器 + 实时预览（React 元素渲染，无 XSS） |
| 本地文件系统 | MDX 文件存储 |
| gray-matter | Frontmatter 解析 / 序列化 |
| Sharp | 图片压缩处理 |
| reading-time | 阅读时长（支持中文 CJK 计数） |
| pinyin-pro | 标题 / slug 中文转拼音 |
| Next.js 15 App Router | 路由和 API |

## 目录结构

```
src/
├── app/
│   ├── (admin)/                          # 管理后台路由组（不导出）
│   │   └── admin/
│   │       ├── page.tsx                  # 文章列表页
│   │       └── edit/[...slug]/page.tsx   # 编辑 / 新建文章页
│   │
│   └── api/admin/                        # API 路由（不导出）
│       ├── posts/                        # GET(列表) POST(创建)
│       │   └── [...slug]/                # GET PUT DELETE
│       ├── upload/                       # POST(图片上传)
│       └── git/publish/                  # GET(状态) POST(commit+push)
│
├── components/admin/
│   ├── novel-editor.tsx                  # Markdown 编辑器（编辑 / 分屏 / 预览）
│   ├── image-upload.tsx                  # 图片上传组件
│   └── admin-header.tsx                  # 顶部导航
│
├── lib/admin/
│   ├── fs.ts                             # 文章 CRUD（含路径穿越防护）
│   ├── image.ts                          # 图片处理
│   └── auth.ts                           # 鉴权（localhost + ADMIN_TOKEN）
│
└── types/admin.ts                        # 类型定义
```

## API 路由

所有 `/api/admin/*` 均经 `verifyAuth` 校验（见「安全」章节）。

| API | 方法 | 功能 |
|-----|------|------|
| `/api/admin/posts` | GET / POST | 文章列表 / 创建 |
| `/api/admin/posts/{slug}` | GET / PUT / DELETE | 详情 / 更新 / 删除 |
| `/api/admin/upload` | POST | 上传图片（类型 + 大小校验） |
| `/api/admin/git/publish` | GET / POST | git 状态 / 一键发布 |

## 核心功能

### 1. Markdown 编辑 + 实时预览

- 纯文本编辑，三种视图：**编辑 / 分屏 / 预览**
- 预览由 react-markdown 渲染，继承 prose 样式，与最终文章页一致
- 零富文本依赖，Markdown 无损往返（不会像富文本 ↔ Markdown 转换那样丢格式）

### 2. Slug 自动生成（中文转拼音）

新建文章时按标题自动生成 slug，格式 `{year}/{拼音-kebab}`。中文逐字转拼音（pinyin-pro），英文 / 数字保留，空格转连字符。用户手动编辑后停止自动更新。

标题锚点（`rehype-slug-pinyin`）与目录（`Slugger`）共用同一套拼音逻辑，保证 TOC 点击命中。

### 3. 一键发布

点击「发布」按钮（带变更数量预览）执行：

1. `git status` 检查 `content/posts/` 和 `public/uploads/` 的变更
2. `git add`（仅内容目录，使用 `execFile` 参数数组，杜绝 shell 注入）
3. `git commit -m "message"`
4. `git push`

> 修复点：旧实现只 `git add content/posts/`，上传到 `public/uploads/` 的封面图不会被提交，导致线上缺图。现两目录均纳入。

### 4. 阅读时长

使用 reading-time 库，按 CJK 字符计数（修复了旧实现按空格分词导致中文时长严重失真的问题），中文阅读速度调校为 350 字 / 分钟。

## 安全

⚠️ 管理后台仅本地随用随启，dev server 默认绑 localhost。

鉴权设计（`src/lib/admin/auth.ts` 的 `verifyAuth`）：

- **本机请求**（Host 为 localhost / 127.0.0.1）：直接放行，日常零配置零打扰。
- **非本机请求**（ngrok / cloudflared tunnel / `next dev -H 0.0.0.0` 等误暴露）：必须配置 `ADMIN_TOKEN` 环境变量，且请求头携带 `x-admin-token` 匹配；否则 fail-closed 拒绝。

其他防护：

- 文件操作（fs.ts）有 slug 白名单 + resolve 校验，防路径穿越。
- 发布命令用 `execFile` 参数数组，防 shell 注入。
- 图片上传有类型白名单（JPG / PNG / WebP / GIF）+ 10MB 大小限制。

如需临时把后台暴露到公网：在 `.env.local` 设 `ADMIN_TOKEN=随机串`，前端 fetch 时带上 `x-admin-token` header。

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

## 依赖包

```bash
npm install react-markdown remark-gfm   # 编辑器预览
npm install sharp                        # 图片处理
npm install gray-matter                  # MDX frontmatter
npm install reading-time                 # 阅读时长（CJK）
npm install pinyin-pro                   # 中文转拼音
```
