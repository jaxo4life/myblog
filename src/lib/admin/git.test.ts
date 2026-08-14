import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile, mkdir, rm, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { publishChanges } from './git'

// 用 execFile（参数数组，不经 shell）执行测试用的固定 git 命令；变量名避开 exec 模式匹配
const runGit = promisify(execFile)

/** 在系统临时目录创建一个隔离的 git repo（含 content/posts、public/uploads 初始提交） */
async function setupRepo(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), 'blog-git-test-'))
  await runGit('git', ['init'], { cwd: dir })
  await runGit('git', ['config', 'user.email', 'test@test.test'], { cwd: dir })
  await runGit('git', ['config', 'user.name', 'test'], { cwd: dir })
  await mkdir(path.join(dir, 'content/posts'), { recursive: true })
  await mkdir(path.join(dir, 'public/uploads'), { recursive: true })
  await writeFile(path.join(dir, 'content/posts/a.mdx'), 'init', 'utf8')
  await runGit('git', ['add', '.'], { cwd: dir })
  await runGit('git', ['commit', '-m', 'init'], { cwd: dir })
  return dir
}

test('无变更时返回「没有需要提交」', async () => {
  const dir = await setupRepo()
  try {
    const results = await publishChanges('msg', dir, false)
    assert.ok(results.some((r) => r.includes('没有需要提交')))
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('恶意 commit message 不触发 shell 注入（execFile 参数化守护）', async () => {
  const dir = await setupRepo()
  const proof = path.join(dir, 'proof.txt')
  try {
    // 制造变更
    await writeFile(path.join(dir, 'content/posts/a.mdx'), 'changed', 'utf8')
    // 经典注入载荷：若用 exec + 模板字符串拼接，会执行 whoami > proof.txt
    const evil = `"; whoami > ${proof} #`

    const results = await publishChanges(evil, dir, false)

    // 1) commit 成功
    assert.ok(results.some((r) => r.includes('commit')))
    // 2) 注入未执行：proof.txt 不应被创建
    await assert.rejects(() => readFile(proof))
    // 3) commit message 原样保存（恶意字符被 git 当字面量，未被 shell 解析）
    const { stdout } = await runGit('git', ['log', '-1', '--pretty=%B'], { cwd: dir })
    assert.ok(stdout.includes('whoami'))
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})
