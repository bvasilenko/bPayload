import type { BsuiteToolName } from '../config/types.js'

export type ToolVerdict = 'success' | 'needs-attention' | 'malformed' | 'internal-error' | 'spawn-failed' | 'timeout'

export interface ToolDirectiveResult {
  readonly tool: BsuiteToolName
  readonly verdict: ToolVerdict
  readonly exitCode: number | null
  readonly stdout: string
  readonly stderr: string
  readonly durationMs: number
}

export interface DirectiveBundle {
  readonly cycleId: string
  readonly generatedAt: string
  readonly markerDetected: boolean
  readonly directive: string
  readonly results: readonly ToolDirectiveResult[]
  readonly corpus: {
    readonly pointer: string
  }
}
