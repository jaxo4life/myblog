import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolvePostFile } from './fs'

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
