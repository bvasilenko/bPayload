export const bsuiteToolNames = ['bground', 'banchor', 'bsmell', 'bratch', 'bwatch', 'bspector'] as const

export type BsuiteToolName = (typeof bsuiteToolNames)[number]

export type MarkerMode = 'sentinel' | 'json-tail'

export interface BPayloadConfig {
  readonly collections: readonly string[]
  readonly tools?: Partial<Record<BsuiteToolName, boolean>>
  readonly marker?: MarkerMode
  readonly field?: string
  readonly adminUI?: {
    readonly slot: 'beforeDocumentControls'
  }
  readonly binary?: {
    readonly paths?: Partial<Record<BsuiteToolName, string>>
    readonly timeoutMs?: number
  }
  readonly cycleIdSource?: 'env' | 'generated'
}

export interface ResolvedBPayloadConfig {
  readonly collections: readonly string[]
  readonly enabledTools: readonly BsuiteToolName[]
  readonly marker: MarkerMode
  readonly field: string
  readonly adminSlot: 'beforeDocumentControls'
  readonly binaryPaths: Readonly<Record<BsuiteToolName, string>>
  readonly timeoutMs: number
  readonly cycleIdSource: 'env' | 'generated'
}
