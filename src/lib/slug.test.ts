import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tagToSlug } from './slug'

test('中文标签转拼音（逐字拼接）', () => {
  // 注意：逐字转拼音，多音字取 pinyin-pro 默认音（如「调」→ tiao，非 diào）；slug 仍唯一可读
  assert.equal(tagToSlug('项目调研'), 'xiangmutiaoyan')
  assert.equal(tagToSlug('动手笔记'), 'dongshoubiji')
  assert.equal(tagToSlug('胡说八道'), 'hushuobadao')
})

test('英文 / 数字保留并小写', () => {
  assert.equal(tagToSlug('rss3'), 'rss3')
  assert.equal(tagToSlug('Tips'), 'tips')
})

test('中英混合（空格转连字符）', () => {
  assert.equal(tagToSlug('Web3 探索'), 'web3-tansuo')
})
