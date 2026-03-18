import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  DEFAULT_SITE_LANGUAGE,
  isSiteLanguage,
  SITE_LANGUAGE_STORAGE_KEY,
  type SiteLanguage,
} from '../i18n/language'

type LanguageContextValue = {
  language: SiteLanguage
  setLanguage: (nextLanguage: SiteLanguage) => void
  toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getInitialLanguage(): SiteLanguage {
  if (typeof window === 'undefined') {
    return DEFAULT_SITE_LANGUAGE
  }

  try {
    const storedLanguage = window.localStorage.getItem(SITE_LANGUAGE_STORAGE_KEY)
    if (isSiteLanguage(storedLanguage)) {
      return storedLanguage
    }
  } catch {
    // Ignore storage read failures (private mode / restricted environments).
  }

  return DEFAULT_SITE_LANGUAGE
}

type LanguageProviderProps = {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<SiteLanguage>(getInitialLanguage)

  useEffect(() => {
    document.documentElement.lang = language

    try {
      window.localStorage.setItem(SITE_LANGUAGE_STORAGE_KEY, language)
    } catch {
      // Ignore storage write failures (private mode / restricted environments).
    }
  }, [language])

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => {
        setLanguage((current) => (current === 'en' ? 'de' : 'en'))
      },
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useSiteLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useSiteLanguage must be used within LanguageProvider.')
  }
  return context
}
