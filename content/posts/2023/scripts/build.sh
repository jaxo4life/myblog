#!/bin/bash
# 构建脚本：在静态导出时临时排除管理后台和 API 路由

# 备份目录
BACKUP_DIR=".build-backup"
rm -rf "$BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# 需要排除的文件
files=(
  "src/app/api/admin/posts/route.ts"
  "src/app/api/admin/posts/[...slug]/route.ts"
  "src/app/api/admin/upload/route.ts"
  "src/app/(admin)/admin/page.tsx"
  "src/app/(admin)/admin/layout.tsx"
  "src/app/(admin)/admin/new/page.tsx"
  "src/app/(admin)/admin/edit/[...slug]/page.tsx"
)

# 备份文件
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    cp "$file" "$BACKUP_DIR/$file"
    echo "// Disabled for static export" > "$file"
    echo "export default function Disabled() { return null }" >> "$file"
  fi
done

# 运行构建
npm run build
BUILD_STATUS=$?

# 恢复文件
for file in "${files[@]}"; do
  if [ -f "$BACKUP_DIR/$file" ]; then
    cp "$BACKUP_DIR/$file" "$file"
  fi
done

rm -rf "$BACKUP_DIR"

exit $BUILD_STATUS
