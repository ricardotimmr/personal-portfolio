import { describe, expect, it } from 'vitest'
import { isSiteLanguage, resolveLocalizedValue, type SiteLanguage } from '../../src/i18n/language'

describe('isSiteLanguage', () => {
  it('returns true for supported languages', () => {
    expect(isSiteLanguage('en')).toBe(true)
    expect(isSiteLanguage('de')).toBe(true)
  })

  it('returns false for unsupported values', () => {
    expect(isSiteLanguage('fr')).toBe(false)
    expect(isSiteLanguage(undefined)).toBe(false)
  })
})

describe('resolveLocalizedValue', () => {
  it('returns value for selected language', () => {
    const value: Record<SiteLanguage, string> = {
      en: 'Hello',
      de: 'Hallo',
    }

    expect(resolveLocalizedValue(value, 'en')).toBe('Hello')
    expect(resolveLocalizedValue(value, 'de')).toBe('Hallo')
  })
})
