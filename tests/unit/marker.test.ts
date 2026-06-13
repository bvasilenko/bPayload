import { describe, expect, it } from 'vitest'
import { hasDirectiveMarker } from '../../src/runtime/marker.js'

describe('hasDirectiveMarker', () => {
  it.each([
    ['plain sentinel', '[[bsuite]]'],
    ['directive sentinel', '[[bsuite:directive]]'],
    ['case-insensitive sentinel', '[[BSUITE]]'],
    ['nested array sentinel', { body: [{ text: '[[bsuite]]' }] }],
    ['boolean object marker', { _bsuiteMarker: true }]
  ])('detects sentinel marker shape: %s', (_caseName, value) => {
    expect(hasDirectiveMarker(value, 'sentinel')).toBe(true)
  })

  it.each([
    ['plain text', 'plain'],
    ['partial token', '[[bsuite:other]]'],
    ['false object marker', { _bsuiteMarker: false }],
    ['null', null],
    ['number', 1]
  ])('ignores non-marker sentinel shape: %s', (_caseName, value) => {
    expect(hasDirectiveMarker(value, 'sentinel')).toBe(false)
  })

  it.each([
    ['string tail', 'body text {"bsuite":"directive"}'],
    ['nested string tail', { sections: ['copy', 'tail {"bsuite":"directive"}'] }]
  ])('detects json-tail marker shape: %s', (_caseName, value) => {
    expect(hasDirectiveMarker(value, 'json-tail')).toBe(true)
  })

  it.each([
    ['missing object', 'body text'],
    ['wrong value', 'body text {"bsuite":"other"}'],
    ['malformed json', 'body text {"bsuite":'],
    ['empty array', []]
  ])('ignores invalid json-tail shape: %s', (_caseName, value) => {
    expect(hasDirectiveMarker(value, 'json-tail')).toBe(false)
  })
})
