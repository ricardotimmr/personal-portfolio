import { describe, expect, it } from 'vitest'
import { toSafeExternalUrl } from '../../src/utils/urlSafety'

describe('toSafeExternalUrl', () => {
  it('returns undefined for empty or whitespace input', () => {
    expect(toSafeExternalUrl(undefined)).toBeUndefined()
    expect(toSafeExternalUrl('')).toBeUndefined()
    expect(toSafeExternalUrl('   ')).toBeUndefined()
  })

  it('accepts valid https URLs', () => {
    expect(toSafeExternalUrl('https://github.com/ricardotimmr')).toBe('https://github.com/ricardotimmr')
  })

  it('rejects non-https protocols', () => {
    expect(toSafeExternalUrl('http://example.com')).toBeUndefined()
    expect(toSafeExternalUrl('javascript:alert(1)')).toBeUndefined()
    expect(toSafeExternalUrl('data:text/html,<b>test</b>')).toBeUndefined()
  })

  it('rejects malformed URLs', () => {
    expect(toSafeExternalUrl('not a url')).toBeUndefined()
  })
})
