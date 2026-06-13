import { describe, expect, it } from 'vitest'
import type { Config } from 'payload'
import { bPayload, BPayloadError } from '../../src/index.js'

const baseConfig = {
  secret: 'test-secret',
  db: {} as Config['db'],
  collections: [
    {
      slug: 'articles',
      fields: [{ name: 'title', type: 'text' as const }]
    },
    {
      slug: 'pages',
      fields: [{ name: 'title', type: 'text' as const }]
    }
  ]
} satisfies Config

describe('bPayload', () => {
  it('adds hooks, directive field, and admin component to allowlisted collections only', () => {
    const plugin = bPayload({ collections: ['articles'], tools: { bground: true } })
    const result = plugin(baseConfig) as Config
    const article = result.collections?.find((collection) => collection.slug === 'articles')
    const page = result.collections?.find((collection) => collection.slug === 'pages')

    expect(article?.fields).toHaveLength(2)
    expect(article?.hooks?.beforeValidate).toHaveLength(1)
    expect(article?.hooks?.afterChange).toHaveLength(1)
    expect(article?.admin?.components?.edit?.beforeDocumentControls).toHaveLength(1)
    expect(page?.fields).toHaveLength(1)
    expect(page?.hooks).toBeUndefined()
  })

  it('preserves existing hooks and admin components by appending plugin behavior', () => {
    const beforeValidate = () => ({})
    const afterChange = () => ({})
    const plugin = bPayload({ collections: ['articles'], tools: { bground: true }, field: 'directiveField' })
    const result = plugin({
      ...baseConfig,
      collections: [
        {
          slug: 'articles',
          fields: [{ name: 'title', type: 'text' }],
          hooks: { beforeValidate: [beforeValidate], afterChange: [afterChange] },
          admin: { components: { edit: { beforeDocumentControls: [{ path: './Existing' }] } } }
        }
      ]
    }) as Config
    const collection = result.collections?.[0]

    expect(collection?.hooks?.beforeValidate?.[0]).toBe(beforeValidate)
    expect(collection?.hooks?.afterChange?.[0]).toBe(afterChange)
    expect(collection?.hooks?.beforeValidate).toHaveLength(2)
    expect(collection?.hooks?.afterChange).toHaveLength(2)
    expect(collection?.admin?.components?.edit?.beforeDocumentControls).toHaveLength(2)
    expect(collection?.fields.at(-1)).toMatchObject({ name: 'directiveField', type: 'json', admin: { readOnly: true } })
  })

  it('applies to every allowlisted collection and leaves the config stable when collections are absent', () => {
    const plugin = bPayload({ collections: ['articles', 'pages'], tools: { bground: true } })
    const result = plugin(baseConfig) as Config
    const noCollections = { secret: 'test-secret', db: {} as Config['db'] } satisfies Config

    expect(result.collections?.every((collection) => collection.fields.some((field) => 'name' in field && field.name === '_bsuiteDirective'))).toBe(true)
    expect(plugin(noCollections)).toBe(noCollections)
  })

  it('rejects directive field conflicts before changing a collection', () => {
    const plugin = bPayload({ collections: ['articles'], tools: { bground: true } })

    expect(() =>
      plugin({
        ...baseConfig,
        collections: [
          {
            slug: 'articles',
            fields: [{ name: '_bsuiteDirective', type: 'json' }]
          }
        ]
      })
    ).toThrow(BPayloadError)
  })
})
