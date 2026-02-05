/**
 * xlog 到 MDX 迁移脚本
 *
 * 功能：
 * 1. 读取 728 备份的 markdown 文件
 * 2. 下载 IPFS 图片到本地
 * 3. 转换 frontmatter 格式
 * 4. 中文 slug 转拼音
 * 5. 生成标准 MDX 文件
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const yaml = require('js-yaml');
const { pinyin } = require('pinyin');

// 配置
const CONFIG = {
  sourceDir: path.join(__dirname, '../728/notes-markdown'),
  targetDir: path.join(__dirname, '../content/posts'),
  uploadsDir: path.join(__dirname, '../public/uploads'),
  ipfsGateway: 'https://ipfs.io/ipfs/',
  imageTimeout: 30000,
};

// 标签映射：xlog 标签 -> 新博客标签
// 只移除内部标签，保留用户原始标签
const TAG_MAPPING = {
  'post': null, // 移除 xlog 内部标签
  'page': null, // 移除 xlog 内部标签
  'short': null, // 移除 xlog 内部标签
  '自用': null, // 不迁移
};

// 创建目录
async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

// 中文转拼音 slug
function toPinyinSlug(text) {
  // 如果主要是英文，直接使用英文
  const englishChars = text.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
  const chineseChars = text.replace(/[^\u4e00-\u9fa5]/g, '').trim();

  // 如果英文内容占主导或没有中文，使用英文
  if (englishChars.length > chineseChars.length * 2 || chineseChars.length === 0) {
    return englishChars
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/[^a-z0-9-]/g, '') || 'untitled';
  }

  // 否则转拼音
  const clean = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s-]/g, '').trim();
  const py = pinyin(clean, {
    style: pinyin.STYLE_NORMAL,
    heteronym: false,
  });
  const slug = py
    .flat()
    .join('-')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return slug || 'untitled';
}

// 下载文件
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = require('fs').createWriteStream(dest);

    const req = protocol.get(url, { timeout: CONFIG.imageTimeout }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close();
        try {
          require('fs').unlinkSync(dest);
        } catch (e) {}
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        require('fs').unlinkSync(dest).catch(() => {});
        return reject(new Error(`Failed to download: ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });

    req.on('error', (err) => {
      file.close();
      try {
        require('fs').unlinkSync(dest);
      } catch (e) {}
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      file.close();
      try {
        require('fs').unlinkSync(dest);
      } catch (e) {}
      reject(new Error('Download timeout'));
    });
  });
}

// 处理图片
async function processImages(content, noteId, publishDate) {
  const images = [];
  let index = 0;

  // 创建年份/月份目录
  const date = new Date(publishDate);
  const year = date.getFullYear().toString();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const imagePath = path.join(CONFIG.uploadsDir, year, month);
  await ensureDir(imagePath);

  // 首先处理 ./attachments/ CID 格式（从 markdown 文件）
  let newContent = content.replace(/!\[([^\]]*)\]\(\.\/attachments\/([a-zA-Z0-9]+)\)/g, (orig, alt, cid) => {
    const ext = cid.startsWith('Qm') || cid.startsWith('bafkbei') ? 'jpg' : 'png';
    const filename = `${noteId}-${index++}.${ext}`;
    const localPath = path.join(imagePath, filename);
    const publicPath = `/uploads/${year}/${month}/${filename}`;

    images.push({
      cid,
      localPath,
      publicPath,
    });

    return `![${alt}](${publicPath})`;
  });

  // 然后处理 ipfs:// CID 格式（从 JSON content）
  newContent = newContent.replace(/!\[([^\]]*)\]\(ipfs:\/\/([a-zA-Z0-9]+)\)/g, (orig, alt, cid) => {
    // 检查是否已经处理过
    if (images.some(img => img.cid === cid)) {
      return orig; // 已处理，跳过
    }

    const ext = cid.startsWith('Qm') || cid.startsWith('bafkbei') ? 'jpg' : 'png';
    const filename = `${noteId}-${index++}.${ext}`;
    const localPath = path.join(imagePath, filename);
    const publicPath = `/uploads/${year}/${month}/${filename}`;

    images.push({
      cid,
      localPath,
      publicPath,
    });

    return `![${alt}](${publicPath})`;
  });

  // 下载图片
  for (const img of images) {
    try {
      await downloadFile(CONFIG.ipfsGateway + img.cid, img.localPath);
      console.log(`  ✓ Downloaded: ${img.cid}`);
    } catch (err) {
      console.error(`  ✗ Failed to download ${img.cid}: ${err.message}`);
      // 失败时保留 IPFS 链接作为后备
      newContent = newContent.replace(img.publicPath, `${CONFIG.ipfsGateway}${img.cid}`);
    }
  }

  return newContent;
}

// 解析 frontmatter
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { metadata: {}, body: content };

  try {
    const metadata = yaml.load(match[1]);
    const body = match[2].trim();
    return { metadata, body };
  } catch (err) {
    console.error(`Error parsing YAML: ${err.message}`);
    return { metadata: {}, body: match[2] };
  }
}

// 格式化日期
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
}

// 迁移单篇文章
async function migratePost(folderPath) {
  const files = await fs.readdir(folderPath);
  const mdFile = files.find(f => f.endsWith('.md') && f !== 'attach_download_failed.txt');

  if (!mdFile) {
    console.log(`⊘ Skipping ${folderPath}: No markdown file found`);
    return null;
  }

  const filePath = path.join(folderPath, mdFile);
  const content = await fs.readFile(filePath, 'utf8');
  const { metadata, body } = parseFrontmatter(content);

  // 跳过自用笔记
  if (metadata.tags?.includes('自用')) {
    console.log(`⊘ Skipping ${metadata.title}: 自用 note`);
    return null;
  }

  // 提取 noteId
  const folderName = path.basename(folderPath);
  const noteId = folderName.split(' - ')[0];

  // 处理标签
  const rawTags = metadata.tags || [];
  const tags = rawTags
    .map(tag => TAG_MAPPING[tag] || tag)
    .filter(t => t && t !== 'post' && t !== 'page' && t !== 'short');

  // 去重
  const uniqueTags = [...new Set(tags)];

  // 处理日期
  const date = metadata.date_published || metadata.createdAt;
  const year = new Date(date).getFullYear().toString();
  const formattedDate = formatDate(date);

  // 生成 slug
  // 如果 xlog_slug 看起来像随机 ID，则使用标题
  const xlogSlug = metadata.attributes?.find?.(a => a.trait_type === 'xlog_slug')?.value;
  // 随机 ID 的特征：包含大写和 lowercase 混合（驼峰式），或短小无意义
  const isRandomId = xlogSlug && (
    // 驼峰式混合且包含数字/特殊字符
    (/[a-z][A-Z]/.test(xlogSlug) && xlogSlug.length > 10) ||
    // 短小无意义的 ID（如 xmdy-zora, was, efp, eip, joke1, fakel2）
    (/^[a-z0-9]{3,10}(-[a-z])?$/.test(xlogSlug)) ||
    // 长纯字母数字串且包含大写
    (/^[a-zA-Z0-9]{15,}$/.test(xlogSlug) && /[A-Z]/.test(xlogSlug))
  );
  const baseSlug = (xlogSlug && !isRandomId) ? xlogSlug : (metadata.title || 'untitled');
  const slug = toPinyinSlug(baseSlug);

  // 处理内容中的图片
  console.log(`Processing: ${metadata.title}`);
  const processedBody = await processImages(body, noteId, date);

  // 处理 summary
  const summary = (metadata.summary || '')
    .replace(/'/g, "''")
    .substring(0, 200);

  // 生成新的 frontmatter
  const frontmatter = `---
title: '${metadata.title.replace(/'/g, "''")}'
date: ${formattedDate}
summary: '${summary}'
tags: [${uniqueTags.map(t => `'${t}'`).join(', ')}]
featured: false
draft: false
cover: ''
---

${processedBody}`;

  // 写入文件
  const targetPath = path.join(CONFIG.targetDir, year);
  await ensureDir(targetPath);

  const finalPath = path.join(targetPath, `${slug}.mdx`);
  await fs.writeFile(finalPath, frontmatter, 'utf8');

  return {
    title: metadata.title,
    slug,
    year,
    date: formattedDate,
    tags: uniqueTags,
  };
}

// 主函数
async function main() {
  console.log('开始迁移 xlog 数据...\n');

  // 清空并重建目标目录
  await fs.rm(CONFIG.targetDir, { recursive: true, force: true });
  await ensureDir(CONFIG.targetDir);

  // 读取所有文章文件夹
  const folders = await fs.readdir(CONFIG.sourceDir);
  const results = [];
  let skipped = 0;

  for (const folder of folders) {
    const folderPath = path.join(CONFIG.sourceDir, folder);
    const stat = await fs.stat(folderPath);

    if (stat.isDirectory()) {
      try {
        const result = await migratePost(folderPath);
        if (result) {
          results.push(result);
        } else {
          skipped++;
        }
      } catch (err) {
        console.error(`✗ Error migrating ${folder}:`, err.message);
      }
    }
  }

  // 输出统计
  console.log('\n========== 迁移完成 ==========');
  console.log(`总计处理: ${folders.length} 篇`);
  console.log(`成功迁移: ${results.length} 篇`);
  console.log(`跳过: ${skipped} 篇`);
  console.log('\n按年份统计:');
  const byYear = {};
  results.forEach(r => {
    byYear[r.year] = (byYear[r.year] || 0) + 1;
  });
  Object.entries(byYear).sort().forEach(([year, count]) => {
    console.log(`  ${year}: ${count} 篇`);
  });

  console.log('\n按标签统计:');
  const tagCount = {};
  results.forEach(r => {
    r.tags.forEach(t => {
      tagCount[t] = (tagCount[t] || 0) + 1;
    });
  });
  Object.entries(tagCount).sort((a, b) => b[1] - a[1]).forEach(([tag, count]) => {
    console.log(`  ${tag}: ${count} 篇`);
  });
}

main().catch(console.error);
