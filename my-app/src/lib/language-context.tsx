import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { LanguageCode, LanguageStrings } from '../types/user'
import { translations } from './translations'

interface LanguageState {
  lang: LanguageCode
  dict: LanguageStrings
  setLang: (next: LanguageCode) => void
}

const LanguageContext = createContext<LanguageState | null>(null)

// Maps a browser locale string (e.g. from navigator.language, which can be
// "zh-CN", "zh-TW", "zh-Hans", "en-US", etc.) to one of our supported
// LanguageCodes. Falls back to 'en' when nothing matches.
function detectBrowserLanguage(): LanguageCode {
  if (typeof navigator === 'undefined') return 'en'

  const candidates =
    navigator.languages && navigator.languages.length > 0 ? navigator.languages : [navigator.language]

  for (const raw of candidates) {
    if (!raw) continue
    const lower = raw.toLowerCase()
    if (lower.startsWith('zh')) return 'zh-CN'
    if (lower.startsWith('ko')) return 'ko'
    if (lower.startsWith('vi')) return 'vi'
    if (lower.startsWith('fr')) return 'fr'
    if (lower.startsWith('pt')) return 'pt-BR'
    if (lower.startsWith('en')) return 'en'
  }

  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(() => {
    // A previously saved choice (from the sidebar dropdown) always wins —
    // detection only kicks in for a first-time visitor with nothing stored.
    const stored = localStorage.getItem('zoo_lang') as LanguageCode | null
    return stored || detectBrowserLanguage()
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-lang', lang)
  }, [lang])

  function setLang(next: LanguageCode) {
    setLangState(next)
    localStorage.setItem('zoo_lang', next)
  }

  return (
    <LanguageContext.Provider value={{ lang, dict: translations[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageState {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
