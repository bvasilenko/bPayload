import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export async function writeExecutable(script: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'bpayload-'))
  const path = join(dir, 'tool.mjs')
  await writeFile(path, script, { mode: 0o755 })
  return path
}
