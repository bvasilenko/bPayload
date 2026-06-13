import { describe, expect, it, vi } from 'vitest'
import { fanOut } from '../../src/runtime/fanOut.js'
import { normalizeConfig } from '../../src/config/normalizeConfig.js'
import { createAfterChangeHook } from '../../src/hooks/afterChange.js'
import { createBeforeValidateHook } from '../../src/hooks/beforeValidate.js'
import { readDirectiveBundle } from '../../src/storage/requestStorage.js'

vi.mock('../../src/runtime/fanOut.js', () => ({
  fanOut: vi.fn(() =>
    Promise.resolve({
      cycleId: 'cycle-1',
      generatedAt: '2026-06-13T00:00:00.000Z',
      markerDetected: true,
      directive: 'GROUNDED - proceed.',
      results: [
        {
          tool: 'bground',
          verdict: 'success',
          exitCode: 0,
          stdout: 'GROUNDED - proceed.',
          stderr: '',
          durationMs: 1
        }
      ],
      corpus: { pointer: 'runtime-managed' }
    })
  )
}))

describe('collection hooks', () => {
  it('passes through and avoids fan-out when the marker is absent', async () => {
    const config = normalizeConfig({ collections: ['articles'], tools: { bground: true } })
    const hook = createBeforeValidateHook(config)
    const req = { context: {} }
    const data = { title: 'Plain article' }

    const result = await hook({ data, req } as never)

    expect(result).toBe(data)
    expect(readDirectiveBundle(req)).toBeUndefined()
    expect(fanOut).not.toHaveBeenCalled()
  })

  it('stores one directive bundle in the configured field when the marker is present', async () => {
    const config = normalizeConfig({ collections: ['articles'], tools: { bground: true }, field: 'directiveField' })
    const hook = createBeforeValidateHook(config)
    const req = {}

    const result = await hook({ data: { body: '[[bsuite]]' }, req } as never)

    expect(result).toMatchObject({
      body: '[[bsuite]]',
      directiveField: {
        cycleId: 'cycle-1',
        directive: 'GROUNDED - proceed.'
      }
    })
    expect(readDirectiveBundle(req)?.cycleId).toBe('cycle-1')
    expect(fanOut).toHaveBeenCalledTimes(1)
  })

  it('reflects request-scoped data after change without mutating storage again', async () => {
    const config = normalizeConfig({ collections: ['articles'], tools: { bground: true } })
    const beforeValidate = createBeforeValidateHook(config)
    const afterChange = createAfterChangeHook(config)
    const req = { context: {} }

    await beforeValidate({ data: { body: '[[bsuite]]' }, req } as never)
    const result = await afterChange({ doc: { id: 1, body: '[[bsuite]]' }, req } as never)

    expect(result).toMatchObject({
      id: 1,
      _bsuiteDirective: {
        cycleId: 'cycle-1'
      }
    })
  })

  it('returns the original document when after-change has no request-scoped directive', async () => {
    const config = normalizeConfig({ collections: ['articles'], tools: { bground: true } })
    const afterChange = createAfterChangeHook(config)
    const doc = { id: 1, body: 'plain' }

    const result = await afterChange({ doc, req: { context: {} } } as never)

    expect(result).toBe(doc)
  })
})
