# Cloudflare Pages 部署指南

本指南介绍如何将博客部署到 Cloudflare Pages。

## 前置准备

1. 一个 Cloudflare 账号（免费即可）
2. 一个 GitHub 仓库
3. Node.js 18+ 环境

## 方法一：通过 GitHub 自动部署

### 步骤

1. **推送代码到 GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/myblog.git
git push -u origin main
```

2. **在 Cloudflare Pages 创建项目**

- 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
- 进入 Pages 页面
- 点击 "Create a project"
- 选择 "Connect to Git"

3. **配置构建设置**

| 设置项 | 值 |
|--------|-----|
| **项目名称** | myblog（或你喜欢的名字） |
| **生产分支** | main |
| **构建命令** | `npm run build:static` |
| **构建输出目录** | `out` |
| **Node.js 版本** | `20` |

4. **环境变量**（可选）

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` | 站点 URL |

5. **部署**

点击 "Save and Deploy"，等待构建完成。

### 更新部署

每次推送到 main 分支会自动触发重新部署。

## 方法二：手动部署

### 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 登录 Cloudflare

```bash
wrangler login
```

### 构建并部署

```bash
npm run build
wrangler pages deploy out --project-name=myblog
```

## 自定义域名

### 1. 在 Cloudflare Pages 项目设置中

1. 进入项目 → Custom domains
2. 点击 "Set up a custom domain"
3. 输入你的域名（如 `blog.example.com`）

### 2. 配置 DNS

如果域名在 Cloudflare：
- 系统会自动添加 DNS 记录

如果域名在其他提供商：
- 添加 CNAME 记录指向你的 Pages 项目域名

### 3. 等待 SSL 证书

Cloudflare 会自动为你的域名签发 SSL 证书。

## 常见问题

### 构建失败

**问题**: 构建时提示找不到模块

**解决**: 确保 `node_modules` 被正确安装，检查 package.json

### 图片无法显示

**问题**: 使用 Unsplash 等外部图片可能被阻止

**解决**:
1. 将图片放到 `public/` 目录
2. 使用相对路径引用
3. 或在 Cloudflare Pages 设置中允许外部图片源

### 404 错误

**问题**: 部分页面返回 404

**解决**:
1. 检查 `trailingSlash: true` 配置是否生效
2. 确保 `out/` 目录结构正确
3. 检查静态文件是否正确生成

## 性能优化

### 启用缓存

在 Cloudflare Pages 设置中：
- Cache Everything: 开启
- Cache Level: Standard

### 配置 Cache Rules

```javascript
// _headers 文件示例
/
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400

/*.js
  Cache-Control: public, max-age=31536000, immutable
```

### 优化图片

1. 使用适当尺寸的图片
2. 使用 WebP 格式
3. 启用 Cloudflare Image Resizing

## 监控与分析

### Cloudflare Analytics

1. 进入项目 → Analytics
2. 查看访问量、带宽、请求数

### 添加 Google Analytics

1. 在 Google Analytics 创建属性
2. 将跟踪 ID 添加到 `src/app/layout.tsx`:

```typescript
<Script
  src="https://www.go.com/gtag/js?id=G-XXXXXXXXXX"
  strategy="afterInteractive"
/>
```

## 总结

- ✅ 免费托管，无限带宽
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS
- ✅ Git 自动部署
- ✅ 预览部署
