#!/bin/bash

# 静态构建脚本 - 临时移除 admin 和 api 路由
# （output:'export' 不允许动态 API routes，故构建前物理移走、构建后恢复）

ADMIN_DIR="src/app/(admin)"
API_DIR="src/app/api"
ADMIN_BACKUP=".admin-backup"
API_BACKUP=".api-backup"

# 恢复被移走的目录（幂等：仅在 backup 存在时执行）
restore() {
  if [ -d "$ADMIN_BACKUP" ]; then
    mv "$ADMIN_BACKUP" "$ADMIN_DIR" && echo "  → admin 文件夹已恢复"
  fi
  if [ -d "$API_BACKUP" ]; then
    mv "$API_BACKUP" "$API_DIR" && echo "  → api 文件夹已恢复"
  fi
}

# 关键：任何退出情况（成功 / 失败 / Ctrl+C 中断）都触发恢复，杜绝目录丢失
trap restore EXIT

echo "🔧 Preparing for static build..."

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

# trap EXIT 会自动 restore，这里只报结果
if [ $BUILD_STATUS -eq 0 ]; then
  echo "✅ Build completed successfully!"
else
  echo "❌ Build failed!"
  exit $BUILD_STATUS
fi
