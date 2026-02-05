#!/bin/bash

# 静态构建脚本 - 临时移除 admin 和 api 路由

ADMIN_DIR="src/app/(admin)"
API_DIR="src/app/api"
ADMIN_BACKUP=".admin-backup"
API_BACKUP=".api-backup"

echo "🔧 Preparing for static build..."

# 备份并移除 admin 和 api 文件夹
if [ -d "$ADMIN_DIR" ]; then
  echo "  → Temporarily moving admin folder..."
  mv "$ADMIN_DIR" "$ADMIN_BACKUP"
fi

if [ -d "$API_DIR" ]; then
  echo "  → Temporarily moving api folder..."
  mv "$API_DIR" "$API_BACKUP"
fi

# 运行构建（设置环境变量启用静态导出）
echo "🏗️  Building..."
STATIC_BUILD=true npm run build
BUILD_STATUS=$?

# 恢复文件夹
echo "🔧 Restoring folders..."
if [ -d "$ADMIN_BACKUP" ]; then
  echo "  → Restoring admin folder..."
  mv "$ADMIN_BACKUP" "$ADMIN_DIR"
fi

if [ -d "$API_BACKUP" ]; then
  echo "  → Restoring api folder..."
  mv "$API_BACKUP" "$API_DIR"
fi

if [ $BUILD_STATUS -eq 0 ]; then
  echo "✅ Build completed successfully!"
else
  echo "❌ Build failed!"
  exit $BUILD_STATUS
fi
