import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { buildConfig } from 'payload'
import { bPayload } from '@booga/bpayload'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? 'fixture-secret',
  db: mongooseAdapter({ url: process.env.DATABASE_URI ?? 'mongodb://127.0.0.1:27017/bpayload-fixture' }),
  collections: [
    {
      slug: 'articles',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'body', type: 'textarea' }
      ],
      versions: {
        drafts: true
      }
    }
  ],
  plugins: [
    bPayload({
      collections: ['articles'],
      tools: { bground: true },
      binary: {
        paths: { bground: process.env.BGROUND_BIN ?? 'bground' }
      }
    })
  ]
})
