export type SiteLanguage = 'en' | 'de'

export const SITE_LANGUAGE_STORAGE_KEY = 'rt-site-language'
export const DEFAULT_SITE_LANGUAGE: SiteLanguage = 'en'

const SUPPORTED_LANGUAGES: SiteLanguage[] = ['en', 'de']

export function isSiteLanguage(value: unknown): value is SiteLanguage {
  return typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value as SiteLanguage)
}

export function resolveLocalizedValue<T>(value: Record<SiteLanguage, T>, language: SiteLanguage): T {
  return value[language] ?? value.en
}
