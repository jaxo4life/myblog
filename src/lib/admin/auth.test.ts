import { test } from 'node:test'
import assert from 'node:assert/strict'
import { verifyAuth } from './auth'

/** 构造带指定 Host（和可选 token）的 Request */
function makeReq(host: string, token?: string): Request {
  const headers = new Headers()
  headers.set('host', host)
  if (token) headers.set('x-admin-token', token)
  return new Request('https://' + host + '/', { headers })
}

test('本机请求直接放行（日常零配置）', () => {
  assert.equal(verifyAuth(makeReq('localhost:3000')), true)
  assert.equal(verifyAuth(makeReq('127.0.0.1:3000')), true)
})

test('非本机 + 未配 ADMIN_TOKEN → fail-closed 拒绝', () => {
  const old = process.env.ADMIN_TOKEN
  delete process.env.ADMIN_TOKEN
  assert.equal(verifyAuth(makeReq('example.com')), false)
  assert.equal(verifyAuth(makeReq('blog.jaxoo.xyz')), false)
  process.env.ADMIN_TOKEN = old
})

test('非本机 + 配了 token + 匹配 → 放行', () => {
  const old = process.env.ADMIN_TOKEN
  process.env.ADMIN_TOKEN = 'secret-token'
  assert.equal(verifyAuth(makeReq('example.com', 'secret-token')), true)
  process.env.ADMIN_TOKEN = old
})

test('非本机 + token 不匹配 / 缺失 → 拒绝', () => {
  const old = process.env.ADMIN_TOKEN
  process.env.ADMIN_TOKEN = 'secret-token'
  assert.equal(verifyAuth(makeReq('example.com', 'wrong')), false)
  assert.equal(verifyAuth(makeReq('example.com')), false)
  process.env.ADMIN_TOKEN = old
})
