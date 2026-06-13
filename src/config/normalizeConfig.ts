import { BPayloadError } from '../errors.js'
import { bsuiteToolNames, type BPayloadConfig, type BsuiteToolName, type ResolvedBPayloadConfig } from './types.js'

const defaultTimeoutMs = 10_000
const defaultField = '_bsuiteDirective'
const fieldNamePattern = /^[A-Za-z_][A-Za-z0-9_]*$/u

export function normalizeConfig(config: BPayloadConfig): ResolvedBPayloadConfig {
  const collections = uniqueStrings(config.collections, 'collections')
  const enabledTools = resolveEnabledTools(config.tools)
  const field = config.field ?? defaultField
  const timeoutMs = config.binary?.timeoutMs ?? defaultTimeoutMs

  if (!fieldNamePattern.test(field)) {
    throw new BPayloadError({ code: 'config-malformed', message: `Invalid directive field name: ${field}` })
  }

  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new BPayloadError({ code: 'config-malformed', message: `Invalid timeout: ${String(timeoutMs)}` })
  }

  if (enabledTools.length === 0) {
    throw new BPayloadError({ code: 'config-malformed', message: 'At least one b-suite command-line tool must be enabled.' })
  }

  return {
    collections,
    enabledTools,
    marker: config.marker ?? 'sentinel',
    field,
    adminSlot: config.adminUI?.slot ?? 'beforeDocumentControls',
    binaryPaths: resolveBinaryPaths(config.binary?.paths),
    timeoutMs,
    cycleIdSource: config.cycleIdSource ?? 'generated'
  }
}

function uniqueStrings(values: readonly string[], name: string): readonly string[] {
  if (values.length === 0) {
    throw new BPayloadError({ code: 'config-malformed', message: `${name} must contain at least one collection slug.` })
  }

  const trimmed: string[] = values.map((value: string): string => value.trim())

  if (trimmed.some((value: string): boolean => value.length === 0)) {
    throw new BPayloadError({ code: 'config-malformed', message: `${name} cannot contain empty values.` })
  }

  return Array.from(new Set(trimmed))
}

function resolveEnabledTools(tools: BPayloadConfig['tools']): readonly BsuiteToolName[] {
  if (!tools) {
    return bsuiteToolNames
  }

  return bsuiteToolNames.filter((toolName) => tools[toolName] === true)
}

function resolveBinaryPaths(paths?: Partial<Record<BsuiteToolName, string>>): Readonly<Record<BsuiteToolName, string>> {
  return bsuiteToolNames.reduce<Record<BsuiteToolName, string>>((accumulator, toolName) => {
    accumulator[toolName] = paths?.[toolName] ?? toolName
    return accumulator
  }, {} as Record<BsuiteToolName, string>)
}
