import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolvePostFile, extractImageUrls } from './fs'

test('合法 slug 通过', () => {
  assert.ok(resolvePostFile('2026/my-post'))
  assert.ok(resolvePostFile('2026/中文标题'))
  assert.ok(resolvePostFile('rss3'))
})

test('相对路径穿越拒绝（含 .. ）', () => {
  assert.throws(() => resolvePostFile('../../etc/passwd'))
  assert.throws(() => resolvePostFile('../../../package.json'))
  assert.throws(() => resolvePostFile('2026/../../etc/passwd'))
})

test('绝对路径 / 前导斜杠拒绝', () => {
  assert.throws(() => resolvePostFile('/etc/passwd'))
  assert.throws(() => resolvePostFile('/Windows/system32'))
})

test('shell 元字符 / 非法字符拒绝', () => {
  assert.throws(() => resolvePostFile('a;rm -rf /'))
  assert.throws(() => resolvePostFile('a$(whoami)'))
  assert.throws(() => resolvePostFile('a`id`'))
  assert.throws(() => resolvePostFile(''))
})

test('extractImageUrls 提取 cover + markdown 的 /uploads/ 图', () => {
  const content = '正文 ![图1](/uploads/2025/01/a.jpg) 外链 ![](https://ext.com/b.png) 再 ![图2](/uploads/2025/02/c.webp)'
  const urls = extractImageUrls(content, '/uploads/2025/01/cover.jpg')
  assert.deepEqual(
    urls.sort(),
    ['/uploads/2025/01/a.jpg', '/uploads/2025/01/cover.jpg', '/uploads/2025/02/c.webp'].sort()
  )
})

test('extractImageUrls 只保留 /uploads/ 本地图，忽略外链与其它路径', () => {
  const content = '![](/uploads/x.jpg) ![](https://example.com/y.png) ![](/images/z.gif)'
  assert.deepEqual(extractImageUrls(content), ['/uploads/x.jpg'])
})

test('extractImageUrls cover 为空或非 uploads 时忽略', () => {
  assert.deepEqual(extractImageUrls('text', undefined), [])
  assert.deepEqual(extractImageUrls('text', 'https://ext.com/c.jpg'), [])
})
