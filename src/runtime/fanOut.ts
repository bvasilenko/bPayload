import type { ResolvedBPayloadConfig } from '../config/types.js'
import { BPayloadError } from '../errors.js'
import { createCycleId } from './cycleId.js'
import type { DirectiveBundle } from './directive.js'
import { spawnTool } from './spawnTool.js'

export async function fanOut(document: unknown, config: ResolvedBPayloadConfig): Promise<DirectiveBundle> {
  if (config.enabledTools.length > Object.keys(config.binaryPaths).length) {
    throw new BPayloadError({ code: 'fanout-budget-exceeded', message: 'Fan-out exceeds configured binary paths.' })
  }

  const results = await Promise.all(
    config.enabledTools.map((tool) =>
      spawnTool({
        tool,
        command: config.binaryPaths[tool],
        document,
        timeoutMs: config.timeoutMs
      })
    )
  )

  return {
    cycleId: createCycleId(config),
    generatedAt: new Date().toISOString(),
    markerDetected: true,
    directive: results.map((result) => result.stdout).filter(Boolean).join('\n\n'),
    results,
    corpus: {
      pointer: 'runtime-managed'
    }
  }
}
