import { useEffect, useState } from 'react'
import type { LanguageCode } from '../types/user'
import { translateText } from './translate'

/**
 * Returns `text` translated into `lang`. Shows the original text
 * immediately (no loading flicker to blank), then swaps in the
 * translation once the API call resolves. No-ops for English.
 */
export function useTranslatedText(text: string, lang: LanguageCode): string {
  const [translated, setTranslated] = useState(text)

  useEffect(() => {
    let cancelled = false
    setTranslated(text)

    if (lang === 'en' || !text.trim()) return

    translateText(text, lang).then((result) => {
      if (!cancelled) setTranslated(result)
    })

    return () => {
      cancelled = true
    }
  }, [text, lang])

  return translated
}
