import type { CollectionAfterChangeHook } from 'payload'
import type { ResolvedBPayloadConfig } from '../config/types.js'
import { readDirectiveBundle, type RequestLike } from '../storage/requestStorage.js'

export function createAfterChangeHook(config: ResolvedBPayloadConfig): CollectionAfterChangeHook {
  return ({ doc, req }) => mergeDirective(doc, req, config.field)
}

function mergeDirective(doc: unknown, req: RequestLike, field: string): unknown {
  const bundle = readDirectiveBundle(req)

  if (!bundle || !isRecord(doc)) {
    return doc
  }

  return {
    ...doc,
    [field]: bundle
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
