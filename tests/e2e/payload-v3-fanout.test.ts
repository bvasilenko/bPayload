import { describe, expect, it } from 'vitest'
import { normalizeConfig } from '../../src/config/normalizeConfig.js'
import { createAfterChangeHook } from '../../src/hooks/afterChange.js'
import { createBeforeValidateHook } from '../../src/hooks/beforeValidate.js'
import { writeExecutable } from '../helpers/executable.js'

function stdinStdoutScript(text: string): string {
  return `#!/usr/bin/env node\nprocess.stdin.resume(); process.stdin.on('end', () => process.stdout.write(${JSON.stringify(`${text}\n`)}))\n`
}

describe('Payload v3 lifecycle fixture', () => {
  it.each(['create', 'update', 'draft'] as const)('populates a saved directive during one %s lifecycle pass', async (operation) => {
    const command = await writeExecutable(stdinStdoutScript(`${operation.toUpperCase()} - directive saved.`))
    const config = normalizeConfig({ collections: ['articles'], tools: { bground: true }, binary: { paths: { bground: command } } })
    const beforeValidate = createBeforeValidateHook(config)
    const afterChange = createAfterChangeHook(config)
    const req = { context: {} }

    const validated = await beforeValidate({ data: { body: '[[bsuite]]' }, req, operation: operation === 'draft' ? 'update' : operation } as never)
    const changed = await afterChange({ doc: { id: '1', ...validated }, req, operation: operation === 'draft' ? 'update' : operation } as never)

    expect(changed).toMatchObject({
      body: '[[bsuite]]',
      _bsuiteDirective: {
        directive: `${operation.toUpperCase()} - directive saved.`,
        results: [{ tool: 'bground', verdict: 'success' }]
      }
    })
  })
})
