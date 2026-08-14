import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, access } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import {
  extractStagedUrls,
  rewriteStagedRefs,
  settleImages,
} from './image'

const STAGED = '/cache/uploads/2026/08/123-abc.jpg'

test('extractStagedUrls 提取正文暂存图引用', () => {
  const content = `前文\n\n![封面](${STAGED})\n\n![](/uploads/2026/08/old.jpg)\n\n![外链](https://example.com/a.jpg)`
  assert.deepEqual(extractStagedUrls(content), [STAGED])
})

test('extractStagedUrls 同一引用去重', () => {
  const content = `![](${STAGED}) 和再次 ![](${STAGED})`
  assert.deepEqual(extractStagedUrls(content), [STAGED])
})

test('rewriteStagedRefs 替换全部出现并保留其余文本', () => {
  const content = `![a](${STAGED}) 中间文字 ![b](${STAGED})`
  const { text, stagedUrls } = rewriteStagedRefs(content)
  assert.equal(text, `![a](/uploads/2026/08/123-abc.jpg) 中间文字 ![b](/uploads/2026/08/123-abc.jpg)`)
  assert.deepEqual(stagedUrls, [STAGED])
})

test('rewriteStagedRefs 不动正式 uploads 引用', () => {
  const content = '![](/uploads/2026/08/keep.jpg)'
  const { text, stagedUrls } = rewriteStagedRefs(content)
  assert.equal(text, content)
  assert.deepEqual(stagedUrls, [])
})

test('settleImages 集成：cover 与正文引用结算、文件移入 uploads、URL 改写', async () => {
  const cwd = await mkdtemp(path.join(tmpdir(), 'myblog-settle-'))
  const rel = '2026/08/123-abc.jpg'
  const stagingPath = path.join(cwd, 'public/cache/uploads', rel)

  await mkdir(path.dirname(stagingPath), { recursive: true })
  await writeFile(stagingPath, 'fake-jpeg-bytes')

  const settled = await settleImages(
    {
      title: 't',
      cover: `/cache/uploads/${rel}`,
      content: `![](/cache/uploads/${rel})\n\n![](/uploads/2026/08/keep.jpg)`,
    },
    cwd
  )

  // URL 改写
  assert.equal(settled.cover, `/uploads/${rel}`)
  assert.ok(settled.content.includes(`![](/uploads/${rel})`))
  assert.ok(settled.content.includes('![](/uploads/2026/08/keep.jpg)'))

  // 文件已移动：uploads 有、cache 无
  await readFile(path.join(cwd, 'public/uploads', rel)) // 不抛即存在
  await assert.rejects(access(stagingPath))
})

test('settleImages 无暂存引用时原样返回（幂等）', async () => {
  const post = { cover: '/uploads/2026/08/a.jpg', content: '![](/uploads/2026/08/a.jpg)' }
  const settled = await settleImages(post, await mkdtemp(path.join(tmpdir(), 'myblog-idempotent-')))
  assert.equal(settled.cover, post.cover)
  assert.equal(settled.content, post.content)
})

test('settleImages 暂存文件缺失时抛错（避免写出悬空引用）', async () => {
  const cwd = await mkdtemp(path.join(tmpdir(), 'myblog-missing-'))
  await assert.rejects(
    settleImages({ cover: '/cache/uploads/2026/08/gone.jpg', content: '' }, cwd)
  )
})
