import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DirectivePanel } from '../../src/admin/DirectivePanel.js'
import type { DirectiveBundle } from '../../src/runtime/directive.js'

let fieldValue: DirectiveBundle | undefined

vi.mock('@payloadcms/ui', () => ({
  useDocumentInfo: () => ({ collectionSlug: 'articles' }),
  useField: () => ({ value: fieldValue })
}))

describe('DirectivePanel', () => {
  beforeEach(() => {
    fieldValue = {
      cycleId: 'cycle-1',
      generatedAt: '2026-06-13T00:00:00.000Z',
      markerDetected: true,
      directive: 'GROUNDED - proceed.',
      results: [{ tool: 'bground', verdict: 'success', exitCode: 0, stdout: 'GROUNDED - proceed.', stderr: '', durationMs: 1 }],
      corpus: { pointer: 'runtime-managed' }
    }
  })

  it('renders the saved directive, verdict, and corpus pointer', () => {
    render(<DirectivePanel />)

    expect(screen.getByTestId('bsuite-directive-panel')).toBeTruthy()
    expect(screen.getByText('GROUNDED - proceed.')).toBeTruthy()
    expect(screen.getByText(/bground/u)).toBeTruthy()
    expect(screen.getByText(/runtime-managed/u)).toBeTruthy()
  })

  it('renders nothing when the directive field is empty', () => {
    fieldValue = undefined

    const { container } = render(<DirectivePanel />)

    expect(container.childElementCount).toBe(0)
  })
})
