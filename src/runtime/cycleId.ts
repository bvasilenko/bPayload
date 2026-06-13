import { randomUUID } from 'node:crypto'
import type { ResolvedBPayloadConfig } from '../config/types.js'

export function createCycleId(config: ResolvedBPayloadConfig): string {
  if (config.cycleIdSource === 'env') {
    const envValue = process.env.BSUITE_CYCLE_ID?.trim()

    if (envValue) {
      return envValue
    }
  }

  return randomUUID()
}
