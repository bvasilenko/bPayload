import { spawn } from 'node:child_process'
import type { BsuiteToolName } from '../config/types.js'
import { BPayloadError } from '../errors.js'
import type { ToolDirectiveResult, ToolVerdict } from './directive.js'

export interface SpawnToolInput {
  readonly tool: BsuiteToolName
  readonly command: string
  readonly document: unknown
  readonly timeoutMs: number
}

export async function spawnTool(input: SpawnToolInput): Promise<ToolDirectiveResult> {
  const startedAt = Date.now()

  return new Promise<ToolDirectiveResult>((resolve, reject: (reason: unknown) => void) => {
    const child = spawn(input.command, [], { stdio: ['pipe', 'pipe', 'pipe'] })
    const stdout: Buffer[] = []
    const stderr: Buffer[] = []
    let settled = false

    const settle = (value: ToolDirectiveResult): void => {
      if (settled) {
        return
      }

      settled = true
      clearTimeout(timer)
      resolve(value)
    }

    const fail = (cause: unknown): void => {
      if (settled) {
        return
      }

      settled = true
      clearTimeout(timer)
      reject(cause instanceof Error ? cause : new Error(String(cause)))
    }

    const timer = setTimeout(() => {
      child.kill('SIGTERM')
      settle(toResult(input.tool, 'timeout', null, stdout, stderr, startedAt))
    }, input.timeoutMs)

    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk))
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk))

    child.on('error', (cause: unknown) => {
      settle({
        tool: input.tool,
        verdict: 'spawn-failed',
        exitCode: null,
        stdout: '',
        stderr: cause instanceof Error ? cause.message : String(cause),
        durationMs: Date.now() - startedAt
      })
    })

    child.on('close', (exitCode) => {
      try {
        settle(toResult(input.tool, classifyExitCode(exitCode), exitCode, stdout, stderr, startedAt))
      } catch (cause) {
        fail(cause)
      }
    })

    child.stdin.on('error', () => undefined)
    child.stdin.end(JSON.stringify(input.document))
  })
}

function toResult(
  tool: BsuiteToolName,
  verdict: ToolVerdict,
  exitCode: number | null,
  stdout: readonly Buffer[],
  stderr: readonly Buffer[],
  startedAt: number
): ToolDirectiveResult {
  const stdoutText = Buffer.concat(stdout).toString('utf8').trim()

  if (verdict === 'success' && stdoutText.length === 0) {
    throw new BPayloadError({ code: 'binary-malformed-output', message: `${tool} produced empty stdout.` })
  }

  return {
    tool,
    verdict,
    exitCode,
    stdout: stdoutText,
    stderr: Buffer.concat(stderr).toString('utf8').trim(),
    durationMs: Date.now() - startedAt
  }
}

function classifyExitCode(exitCode: number | null): ToolVerdict {
  if (exitCode === 0) {
    return 'success'
  }

  if (exitCode === 1) {
    return 'needs-attention'
  }

  if (exitCode === 2) {
    return 'malformed'
  }

  if (exitCode === 64) {
    return 'internal-error'
  }

  return 'spawn-failed'
}
