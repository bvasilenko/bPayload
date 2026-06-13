import type { CollectionBeforeValidateHook } from 'payload'
import type { ResolvedBPayloadConfig } from '../config/types.js'
import { fanOut } from '../runtime/fanOut.js'
import { hasDirectiveMarker } from '../runtime/marker.js'
import { writeDirectiveBundle } from '../storage/requestStorage.js'

export function createBeforeValidateHook(config: ResolvedBPayloadConfig): CollectionBeforeValidateHook {
  return async ({ data, req }) => {
    if (!hasDirectiveMarker(data, config.marker)) {
      return data
    }

    const bundle = await fanOut(data, config)
    writeDirectiveBundle(req, bundle)

    return {
      ...data,
      [config.field]: bundle
    }
  }
}
