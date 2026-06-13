import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/admin/DirectivePanel.tsx'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  external: ['payload', '@payloadcms/ui', 'react', 'react/jsx-runtime', 'react-markdown']
})
