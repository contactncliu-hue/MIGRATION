import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { LanguageCode, LanguageStrings } from '../types/user'
import { translations } from './translations'

interface LanguageState {
  lang: LanguageCode
  dict: LanguageStrings
  setLang: (next: LanguageCode) => void
}

const LanguageContext = createContext<LanguageState | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(
    () => (localStorage.getItem('zoo_lang') as LanguageCode) || 'en'
  )

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
