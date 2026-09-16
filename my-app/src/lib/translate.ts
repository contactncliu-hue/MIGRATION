import type { LanguageCode } from '../types/user'

const CACHE_PREFIX = 'zoo_translate::'

// MyMemory's target-language codes for each of our supported languages.
// English is the source language everywhere (admin content is assumed
// to be entered in English) and is intentionally left out — callers
// should skip translation entirely when targetLang === 'en'.
const MYMEMORY_TARGET: Partial<Record<LanguageCode, string>> = {
  fr: 'fr',
  'pt-BR': 'pt-BR',
  vi: 'vi',
  ko: 'ko',
  'zh-CN': 'zh-CN',
}

function cacheKey(text: string, target: string): string {
  return `${CACHE_PREFIX}${target}::${text}`
}

/**
 * Translates `text` (assumed English) into `targetLang` using MyMemory's
 * free translation API. Results are cached in sessionStorage so the same
 * string isn't re-translated on every render/reload within a session.
 * Falls back to the original text on any failure, or when targetLang
 * has no mapping (e.g. 'en', or an unsupported code).
 */
export async function translateText(text: string, targetLang: LanguageCode): Promise<string> {
  const trimmed = text.trim()
  if (!trimmed || targetLang === 'en') return text

  const target = MYMEMORY_TARGET[targetLang]
  if (!target) return text

  const key = cacheKey(text, target)
  try {
    const cached = sessionStorage.getItem(key)
    if (cached) return cached
  } catch {
    // sessionStorage unavailable (private browsing, etc.) — just skip caching
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${target}`
    const res = await fetch(url)
    if (!res.ok) return text

    const data = await res.json()
    const translated = data?.responseData?.translatedText
    if (typeof translated === 'string' && translated.trim()) {
      try {
        sessionStorage.setItem(key, translated)
      } catch {
        // ignore cache-write failures
      }
      return translated
    }
  } catch (err) {
    console.error('Translation request failed:', err)
  }

  return text
}
