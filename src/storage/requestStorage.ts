import type { DirectiveBundle } from '../runtime/directive.js'

const contextKey = 'bsuiteDirectiveBundle'

export interface RequestLike {
  context?: Record<string, unknown>
}

export function writeDirectiveBundle(req: RequestLike, bundle: DirectiveBundle): void {
  req.context ??= {}
  req.context[contextKey] = bundle
}

export function readDirectiveBundle(req: RequestLike): DirectiveBundle | undefined {
  const value = req.context?.[contextKey]
  return isDirectiveBundle(value) ? value : undefined
}

function isDirectiveBundle(value: unknown): value is DirectiveBundle {
  return typeof value === 'object' && value !== null && 'cycleId' in value && 'results' in value
}
