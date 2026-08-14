import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1'])

/** 取请求主机名（去端口），兼顾反代/tunnel 场景 */
function getHostname(request: Request): string | null {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  if (!host) return null
  return host.split(':')[0].toLowerCase()
}

/** 请求是否来自本机（dev server 默认仅监听 localhost） */
export function isLocalRequest(request: Request): boolean {
  const hostname = getHostname(request)
  return hostname !== null && LOCAL_HOSTS.has(hostname)
}

/** 常数时间字符串比较，防时序侧信道 */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/**
 * 校验 admin API 请求。
 *
 * 威胁模型：本地随用随启，dev server 默认绑 localhost，外部不可达。
 * - 本机请求：直接放行（日常零配置、零打扰）。
 * - 非本机（ngrok / cloudflared tunnel / `-H 0.0.0.0` 等误暴露）：
 *   必须配置 ADMIN_TOKEN 且请求头 `x-admin-token` 匹配，否则一律拒绝（fail-closed）。
 *
 * 想把后台临时暴露到公网时，在 `.env.local` 设 `ADMIN_TOKEN=随机串`，
 * 前端 fetch 时带上 `x-admin-token` header 即可。
 */
export function verifyAuth(request: Request): boolean {
  if (isLocalRequest(request)) return true
  // 运行时读取，便于测试隔离与动态配置
  const token = process.env.ADMIN_TOKEN
  if (!token) return false
  const provided = request.headers.get('x-admin-token')
  if (!provided) return false
  return safeEqual(provided, token)
}

/** 统一的 401 响应 */
export function unauthorized() {
  return NextResponse.json(
    {
      success: false,
      error: '未授权：请通过本机访问，或配置 ADMIN_TOKEN 后在请求头携带 x-admin-token',
    },
    { status: 401 }
  )
}
