import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

// execFile + 参数数组：commit message 作为独立 argv 传入，shell 不参与解析，杜绝命令注入
// 仅这些目录的内容会被纳入发布（content/posts/ + public/uploads/，修复线上缺图）
const CONTENT_PATHS = ['content/posts/', 'public/uploads/']

/** 内容目录的待提交变更（git status --short） */
export async function getChangedContentFiles(cwd: string = process.cwd()): Promise<string> {
  const { stdout } = await execFileAsync('git', ['status', '--short', '--', ...CONTENT_PATHS], { cwd })
  return stdout.trim()
}

/**
 * 一键发布：add → commit → (push)。
 *
 * - cwd 参数化：便于在隔离的临时 git repo 中测试，不污染工作区
 * - push 可关：测试用的 repo 无 remote，跳过 push
 * - 任何 git 步骤失败都会抛错（execFile 非零退出），由调用方（route）捕获返回 500
 *
 * @returns 每步结果摘要
 */
export async function publishChanges(
  message: string,
  cwd: string = process.cwd(),
  push = true
): Promise<string[]> {
  const results: string[] = []

  const status = await getChangedContentFiles(cwd)
  if (!status) {
    results.push('没有需要提交的变更')
    return results
  }
  results.push(`待发布文件：\n${status}`)

  await execFileAsync('git', ['add', '--', ...CONTENT_PATHS], { cwd })
  results.push('git add: 成功')

  const { stdout: commitOut } = await execFileAsync('git', ['commit', '-m', message], { cwd })
  results.push(`git commit: ${commitOut || '成功'}`)

  if (push) {
    const { stdout: pushOut } = await execFileAsync('git', ['push'], { cwd })
    results.push(`git push: ${pushOut || '成功'}`)
  }

  return results
}
