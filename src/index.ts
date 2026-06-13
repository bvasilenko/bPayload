import type { CollectionConfig, Config, Field, Plugin } from 'payload'
import { normalizeConfig } from './config/normalizeConfig.js'
import type { BPayloadConfig, ResolvedBPayloadConfig } from './config/types.js'
import { BPayloadError } from './errors.js'
import { createAfterChangeHook } from './hooks/afterChange.js'
import { createBeforeValidateHook } from './hooks/beforeValidate.js'

export type { BPayloadConfig, BsuiteToolName, MarkerMode, ResolvedBPayloadConfig } from './config/types.js'
export { BPayloadError, type BPayloadErrorCode } from './errors.js'
export type { DirectiveBundle, ToolDirectiveResult, ToolVerdict } from './runtime/directive.js'

export function bPayload(config: BPayloadConfig): Plugin {
  const resolvedConfig = normalizeConfig(config)

  return (incomingConfig: Config): Config => {
    const collections = incomingConfig.collections?.map((collection) =>
      resolvedConfig.collections.includes(collection.slug) ? applyCollectionConfig(collection, resolvedConfig) : collection
    )

    return collections ? { ...incomingConfig, collections } : incomingConfig
  }
}

function applyCollectionConfig(collection: CollectionConfig, config: ResolvedBPayloadConfig): CollectionConfig {
  assertNoFieldConflict(collection, config.field)

  return {
    ...collection,
    fields: [...collection.fields, createDirectiveField(config.field)],
    hooks: {
      ...collection.hooks,
      beforeValidate: [...(collection.hooks?.beforeValidate ?? []), createBeforeValidateHook(config)],
      afterChange: [...(collection.hooks?.afterChange ?? []), createAfterChangeHook(config)]
    },
    admin: {
      ...collection.admin,
      components: {
        ...collection.admin?.components,
        edit: {
          ...collection.admin?.components?.edit,
          beforeDocumentControls: [
            ...(collection.admin?.components?.edit?.beforeDocumentControls ?? []),
            {
              path: '@booga/bpayload/admin#DirectivePanel',
              clientProps: {
                path: config.field
              }
            }
          ]
        }
      }
    }
  }
}

function assertNoFieldConflict(collection: CollectionConfig, fieldName: string): void {
  const conflict = collection.fields.some((field) => 'name' in field && field.name === fieldName)

  if (conflict) {
    throw new BPayloadError({
      code: 'field-name-conflict',
      message: `Collection ${collection.slug} already declares ${fieldName}.`
    })
  }
}

function createDirectiveField(fieldName: string): Field {
  return {
    name: fieldName,
    type: 'json',
    admin: {
      readOnly: true
    }
  }
}
