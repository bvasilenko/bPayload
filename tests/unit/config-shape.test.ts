import { describe, expect, it } from 'vitest'
import { normalizeConfig } from '../../src/config/normalizeConfig.js'
import { BPayloadError } from '../../src/errors.js'

describe('normalizeConfig', () => {
  it('applies stable defaults for a minimal valid configuration', () => {
    const config = normalizeConfig({ collections: ['articles'] })

    expect(config).toMatchObject({
      collections: ['articles'],
      enabledTools: ['bground', 'banchor', 'bsmell', 'bratch', 'bwatch', 'bspector'],
      marker: 'sentinel',
      field: '_bsuiteDirective',
      timeoutMs: 10_000,
      cycleIdSource: 'generated'
    })
    expect(config.binaryPaths).toMatchObject({
      bground: 'bground',
      banchor: 'banchor',
      bsmell: 'bsmell',
      bratch: 'bratch',
      bwatch: 'bwatch',
      bspector: 'bspector'
    })
  })

  it('normalizes collection slugs, enabled tools, and binary path overrides independently', () => {
    const config = normalizeConfig({
      collections: ['articles', ' articles ', 'pages'],
      tools: { bground: true, bsmell: false, bspector: true },
      binary: { paths: { bground: '/bin/bground' }, timeoutMs: 250 },
      field: 'directiveField',
      marker: 'json-tail',
      cycleIdSource: 'env'
    })

    expect(config.collections).toEqual(['articles', 'pages'])
    expect(config.enabledTools).toEqual(['bground', 'bspector'])
    expect(config.binaryPaths.bground).toBe('/bin/bground')
    expect(config.binaryPaths.bspector).toBe('bspector')
    expect(config.timeoutMs).toBe(250)
    expect(config.field).toBe('directiveField')
    expect(config.marker).toBe('json-tail')
    expect(config.cycleIdSource).toBe('env')
  })

  it.each([
    ['empty collections', { collections: [] }],
    ['blank collection slug', { collections: ['articles', ' '] }],
    ['invalid field name', { collections: ['articles'], field: 'bad-name' }],
    ['zero timeout', { collections: ['articles'], binary: { timeoutMs: 0 } }],
    ['negative timeout', { collections: ['articles'], binary: { timeoutMs: -1 } }],
    ['no enabled tools', { collections: ['articles'], tools: { bground: false } }]
  ])('rejects malformed configuration: %s', (_caseName, config) => {
    expect(() => normalizeConfig(config)).toThrow(BPayloadError)
  })
})
