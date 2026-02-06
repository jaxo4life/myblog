/**
 * 修复 IPFS 图片下载脚本
 * 使用多个 IPFS gateway 提高成功率
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

// 配置
const CONFIG = {
  contentDir: path.join(__dirname, '../content/posts'),
  uploadsDir: path.join(__dirname, '../public/uploads'),
  // 多个 IPFS gateway 提高成功率
  gateways: [
    'https://ipfs.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/',
  ],
  imageTimeout: 15000, // 超时时间15秒
  retries: 1, // 只重试1次，加快速度
};

// 备选 IPFS gateway 列表
const FALLBACK_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
];

// 创建目录
async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

// 下载文件（带重试和多 gateway）
async function downloadFile(cid, dest, filename) {
  // 检测文件扩展名
  const ext = cid.startsWith('Qm') || cid.startsWith('bafkbei') ? 'jpg' : 'png';

  // 按 year/month 组织
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const imagePath = path.join(CONFIG.uploadsDir, year, month);
  await ensureDir(imagePath);

  const finalPath = path.join(imagePath, filename || `${cid.slice(0, 8)}.${ext}`);
  const publicPath = `/uploads/${year}/${month}/${path.basename(finalPath)}`;

  // 尝试从不同的 gateway 下载
  for (const gateway of CONFIG.gateways) {
    for (let attempt = 0; attempt < CONFIG.retries; attempt++) {
      try {
        await downloadFromGateway(gateway + cid, finalPath);
        console.log(`  ✓ Downloaded from ${gateway}: ${cid}`);
        return { success: true, localPath: finalPath, publicPath };
      } catch (err) {
        // 继续尝试下一个 gateway
        continue;
      }
    }
  }

  return { success: false, publicPath: `${CONFIG.gateways[0]}${cid}` };
}

function downloadFromGateway(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = require('fs').createWriteStream(dest);

    const req = protocol.get(url, { timeout: CONFIG.imageTimeout }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close();
        try {
          require('fs').unlinkSync(dest);
        } catch (e) {}
        return downloadFromGateway(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        try {
          require('fs').unlinkSync(dest);
        } catch (e) {}
        return reject(new Error(`HTTP ${res.statusCode}`));
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
      reject(new Error('Timeout'));
    });
  });
}

// 从 CID 提取扩展名
function getExtFromCid(cid) {
  if (cid.startsWith('Qm')) return 'jpg';
  if (cid.startsWith('bafkbei') || cid.startsWith('bafybe')) return 'png';
  return 'jpg';
}

// 处理单个 MDX 文件中的 IPFS 图片
async function processFile(filePath) {
  let content = await fs.readFile(filePath, 'utf8');
  const originalContent = content;
  const changes = [];

  // 匹配 IPFS 链接
  const ipfsRegex = /https?:\/\/(?:ipfs\.io\/ipfs\/|gateway\.[^\/]+\/ipfs\/|dweb\.link\/ipfs\/|cloudflare-ipfs\.com\/ipfs\/)?([a-zA-Z0-9]{46,59})(?:\.[a-z]+)?/g;

  const matches = [...content.matchAll(ipfsRegex)];
  if (matches.length === 0) {
    return { processed: 0 };
  }

  const processedCids = new Set();

  for (const match of matches) {
    const fullMatch = match[0];
    const cid = match[1];

    // 跳过已经处理的 CID
    if (processedCids.has(cid)) {
      continue;
    }
    processedCids.add(cid);

    // 提取文件名中的原始名称（如果有）
    let alt = '';
    const altMatch = fullMatch.match(/!\[([^\]]*)\]/);
    if (altMatch) {
      alt = altMatch[1];
    }

    const ext = getExtFromCid(cid);
    const filename = `${cid.slice(0, 8)}-${Date.now()}.${ext}`;

    console.log(`  Processing: ${cid}`);

    const result = await downloadFile(cid, null, filename);

    if (result.success) {
      // 替换所有出现这个 CID 的链接
      content = content.replaceAll(cid, result.publicPath);
      changes.push({ cid, from: cid, to: result.publicPath });
    } else {
      console.log(`  ✗ Failed: ${cid}`);
    }
  }

  // 如果有变化，写回文件
  if (content !== originalContent) {
    await fs.writeFile(filePath, content, 'utf8');
    return { processed: changes.length, changes };
  }

  return { processed: 0 };
}

// 主函数
async function main() {
  console.log('开始修复 IPFS 图片...\n');

  // 确保上传目录存在
  await ensureDir(CONFIG.uploadsDir);

  // 递归查找所有 MDX 文件
  async function findMdxFiles(dir, results = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await findMdxFiles(fullPath, results);
      } else if (entry.name.endsWith('.mdx')) {
        results.push(fullPath);
      }
    }

    return results;
  }

  const files = await findMdxFiles(CONFIG.contentDir);
  console.log(`找到 ${files.length} 个 MDX 文件\n`);

  let totalProcessed = 0;
  let totalFiles = 0;

  for (const file of files) {
    const relPath = path.relative(CONFIG.contentDir, file);
    console.log(`处理: ${relPath}`);

    try {
      const result = await processFile(file);
      if (result.processed > 0) {
        totalProcessed += result.processed;
        totalFiles++;
      }
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
    }
  }

  console.log('\n========== 修复完成 ==========');
  console.log(`处理文件数: ${totalFiles}`);
  console.log(`处理图片数: ${totalProcessed}`);
}

main().catch(console.error);
