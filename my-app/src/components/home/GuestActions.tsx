import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'
import { translations } from '../../lib/translations'
import type { LanguageCode } from '../../types/user'

/**
 * Why a visitor without an account is here: to apply for a migration.
 * Signed-in members already know the way around, so this only shows for guests.
 */
export function GuestActions() {
  const { isGuest } = useAuth()
  const navigate = useNavigate()

  // Same key the sidebar writes, so the two stay in step without extra state.
  const lang = (localStorage.getItem('zoo_lang') as LanguageCode) || 'en'
  const dict = translations[lang] ?? translations.en

  if (!isGuest) return null

  return (
    <div className="home-guest-actions">
      <button
        type="button"
        className="home-guest-primary"
        onClick={() => navigate('/transfer')}
      >
        {dict.applyCta}
      </button>
    </div>
  )
}
