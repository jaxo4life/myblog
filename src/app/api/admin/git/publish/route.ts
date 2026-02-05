import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const runtime = 'nodejs'

// 一键发布：git add, commit, push
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message } = body as { message?: string }

    // 默认提交消息
    const commitMessage = message || '更新文章内容'

    // 执行 git 操作
    const results: string[] = []

    // 1. git add
    try {
      const { stdout: addOutput } = await execAsync('git add content/posts/')
      results.push(`git add: ${addOutput || '成功'}`)
    } catch (error: any) {
      results.push(`git add: ${error.message}`)
    }

    // 2. git status (检查是否有变更)
    try {
      const { stdout: statusOutput } = await execAsync('git status --short')
      if (!statusOutput.trim()) {
        return NextResponse.json({
          success: false,
          message: '没有需要提交的变更',
          results,
        })
      }
    } catch (error: any) {
      // 继续执行
    }

    // 3. git commit
    try {
      const { stdout: commitOutput } = await execAsync(`git commit -m "${commitMessage}"`)
      results.push(`git commit: ${commitOutput || '成功'}`)
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        message: `提交失败: ${error.message}`,
        results,
      }, { status: 500 })
    }

    // 4. git push
    try {
      const { stdout: pushOutput } = await execAsync('git push')
      results.push(`git push: ${pushOutput || '成功'}`)
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        message: `推送失败: ${error.message}`,
        results,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '发布成功！',
      results,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || '发布失败',
    }, { status: 500 })
  }
}

// 获取 git 状态
export async function GET() {
  try {
    const { stdout: statusOutput } = await execAsync('git status --short')
    const hasChanges = statusOutput.trim().length > 0

    return NextResponse.json({
      success: true,
      hasChanges,
      status: statusOutput.trim(),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
