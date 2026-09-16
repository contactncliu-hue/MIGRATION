import { useLanguage } from '../../lib/language-context'
import { useTranslatedText } from '../../lib/useTranslatedText'

/**
 * Wraps any admin-entered/DB-sourced string (pill labels, requirement
 * rows, notes, etc.) so it auto-translates into the viewer's current
 * language. Used instead of calling useTranslatedText directly inside
 * a .map() — hooks can't be called conditionally/in a loop, but a
 * child component instance per item is fine.
 */
export function TranslatedText({ text }: { text: string }) {
  const { lang } = useLanguage()
  const translated = useTranslatedText(text, lang)
  return <>{translated}</>
}
