# bPayload

Your content team writes copy in Payload: articles, product pages, legal disclosures. They use AI assistants in the admin UI to draft. With bPayload installed, the same discipline checks that protect your engineers run on those drafts. When a writer saves a document marked for review, the b-* tools fire: bground verifies factual claims against cited evidence, bsmell flags hedged or unsupported language, banchor checks alignment to the campaign brief. Verdicts appear inline next to the field in the same admin panel: no leaving the editor, no fact-check ping-pong, no after-the-fact retraction.


Payload v3 plugin embedding the b-suite discipline runtime into the CMS authoring UI.

## Install

```bash
npm install -D @booga/bpayload
```

## Usage

```ts
import { buildConfig } from 'payload'
import { bPayload } from '@booga/bpayload'

export default buildConfig({
  collections: [
    {
      slug: 'articles',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'body', type: 'textarea' }
      ]
    }
  ],
  plugins: [
    bPayload({
      collections: ['articles'],
      tools: {
        bground: true,
        banchor: true,
        bsmell: true,
        bratch: true,
        bwatch: true,
        bspector: true
      },
      binary: {
        paths: {
          bground: 'bground',
          banchor: 'banchor',
          bsmell: 'bsmell',
          bratch: 'bratch',
          bwatch: 'bwatch',
          bspector: 'bspector'
        }
      }
    })
  ]
})
```

The plugin runs enabled b-suite command-line tools for marked documents, stores the resulting directive in `_bsuiteDirective`, and renders the saved directive in the document editor.

## Build choice

This package uses `tsup` to publish ESM, CommonJS, and declaration files from the same TypeScript sources with a small configuration surface.

## License

MIT
