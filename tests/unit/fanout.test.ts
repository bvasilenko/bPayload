import { describe, expect, it } from 'vitest'
import { normalizeConfig } from '../../src/config/normalizeConfig.js'
import { BPayloadError } from '../../src/errors.js'
import { fanOut } from '../../src/runtime/fanOut.js'
import { writeExecutable } from '../helpers/executable.js'

function stdoutScript(text: string, exitCode = 0): string {
  return `#!/usr/bin/env node\nprocess.stdout.write(${JSON.stringify(`${text}\n`)}); process.exit(${String(exitCode)})\n`
}

function stdinStdoutScript(text: string): string {
  return `#!/usr/bin/env node\nprocess.stdin.resume(); process.stdin.on('end', () => process.stdout.write(${JSON.stringify(`${text}\n`)}))\n`
}

describe('fanOut', () => {
  it('captures stdout from enabled command-line tools in configuration order', async () => {
    const first = await writeExecutable(stdinStdoutScript('GROUNDED - proceed.'))
    const second = await writeExecutable(stdinStdoutScript('SAFE - install authorized.'))
    const config = normalizeConfig({
      collections: ['articles'],
      tools: { bground: true, bspector: true },
      binary: { paths: { bground: first, bspector: second } }
    })

    const bundle = await fanOut({ body: '[[bsuite]]' }, config)

    expect(bundle.directive).toBe('GROUNDED - proceed.\n\nSAFE - install authorized.')
    expect(bundle.results.map((result) => result.tool)).toEqual(['bground', 'bspector'])
    expect(bundle.results.map((result) => result.verdict)).toEqual(['success', 'success'])
  })

  it.each([
    [1, 'needs-attention', 'UNGROUNDED - supply evidence.'],
    [2, 'malformed', 'MALFORMED - repair input.'],
    [64, 'internal-error', 'INTERNAL_ERROR - retry later.'],
    [7, 'spawn-failed', 'UNEXPECTED - inspect binary.']
  ] as const)('maps exit code %s to %s without dropping stdout', async (exitCode, verdict, stdout) => {
    const command = await writeExecutable(stdoutScript(stdout, exitCode))
    const config = normalizeConfig({ collections: ['articles'], tools: { bground: true }, binary: { paths: { bground: command } } })

    const bundle = await fanOut({ body: '[[bsuite]]' }, config)

    expect(bundle.results[0]).toMatchObject({ verdict, stdout, exitCode })
    expect(bundle.directive).toBe(stdout)
  })

  it('records spawn failures as explicit results', async () => {
    const config = normalizeConfig({ collections: ['articles'], tools: { bground: true }, binary: { paths: { bground: '/missing/bground' } } })

    const bundle = await fanOut({ body: '[[bsuite]]' }, config)

    expect(bundle.results[0]?.verdict).toBe('spawn-failed')
    expect(bundle.results[0]?.stderr).toContain('ENOENT')
  })

  it('records timeout without waiting for child completion', async () => {
    const command = await writeExecutable(`#!/usr/bin/env node\nsetTimeout(() => process.stdout.write('late\\n'), 1000)\n`)
    const config = normalizeConfig({ collections: ['articles'], tools: { bground: true }, binary: { paths: { bground: command }, timeoutMs: 25 } })

    const bundle = await fanOut({ body: '[[bsuite]]' }, config)

    expect(bundle.results[0]?.verdict).toBe('timeout')
  })

  it('rejects successful runs that do not emit directive stdout', async () => {
    const command = await writeExecutable('#!/usr/bin/env node\nprocess.exit(0)\n')
    const config = normalizeConfig({ collections: ['articles'], tools: { bground: true }, binary: { paths: { bground: command } } })

    await expect(fanOut({ body: '[[bsuite]]' }, config)).rejects.toThrow(BPayloadError)
  })
})
