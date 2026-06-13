'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import { useDocumentInfo, useField } from '@payloadcms/ui'
import type { DirectiveBundle } from '../runtime/directive.js'

export interface DirectivePanelProps {
  readonly path?: string
}

export function DirectivePanel({ path = '_bsuiteDirective' }: DirectivePanelProps): React.ReactElement | null {
  const documentInfo = useDocumentInfo()
  const field = useField<DirectiveBundle | undefined>({ path })
  const bundle = field.value

  if (!bundle) {
    return null
  }

  return (
    <section data-testid="bsuite-directive-panel" aria-label="b-suite directive">
      <header>
        <strong>b-suite directive</strong>
        <span>{documentInfo.collectionSlug ? ` ${documentInfo.collectionSlug}` : ''}</span>
      </header>
      <ReactMarkdown>{bundle.directive}</ReactMarkdown>
      <ul aria-label="b-suite verdicts">
        {bundle.results.map((result) => (
          <li key={result.tool} data-verdict={result.verdict}>
            <strong>{result.tool}</strong>: {result.verdict}
          </li>
        ))}
      </ul>
      <small>Corpus: {bundle.corpus.pointer}</small>
    </section>
  )
}

export default DirectivePanel
