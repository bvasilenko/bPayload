import type { MarkerMode } from '../config/types.js'

const sentinelPattern = /\[\[bsuite(?::directive)?\]\]/iu

export function hasDirectiveMarker(value: unknown, mode: MarkerMode): boolean {
  if (mode === 'json-tail') {
    return hasJsonTailMarker(value)
  }

  return hasSentinelMarker(value)
}

function hasSentinelMarker(value: unknown): boolean {
  if (typeof value === 'string') {
    return sentinelPattern.test(value)
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasSentinelMarker(item))
  }

  if (isRecord(value)) {
    if (value._bsuiteMarker === true) {
      return true
    }

    return Object.values(value).some((item) => hasSentinelMarker(item))
  }

  return false
}

function hasJsonTailMarker(value: unknown): boolean {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    const startIndex = trimmed.lastIndexOf('{')

    if (startIndex < 0) {
      return false
    }

    try {
      const parsed = JSON.parse(trimmed.slice(startIndex)) as unknown
      return isRecord(parsed) && parsed.bsuite === 'directive'
    } catch {
      return false
    }
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasJsonTailMarker(item))
  }

  if (isRecord(value)) {
    return Object.values(value).some((item) => hasJsonTailMarker(item))
  }

  return false
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
