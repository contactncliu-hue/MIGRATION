import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth-context'
import { translations } from '../../lib/translations'
import type { LanguageCode } from '../../types/user'

/**
 * Why a visitor without an account is here: to apply for a migration.
 * Signed-in members already know the way around, so this only shows for guests.
 *
 * Waits on `loading` before deciding anything. `isGuest` defaults optimistically
 * before the first session/profile check resolves, so rendering on isGuest alone
 * caused this to flash visible for a frame and then disappear once the real
 * auth state came back for signed-in users. Now it renders nothing at all until
 * loading is false, so there's no flash — the button just appears once (if at
 * all) after auth state is actually known.
 */
export function GuestActions() {
  const { isGuest, loading } = useAuth()
  const navigate = useNavigate()

  // Same key the sidebar writes, so the two stay in step without extra state.
  const lang = (localStorage.getItem('zoo_lang') as LanguageCode) || 'en'
  const dict = translations[lang] ?? translations.en

  if (loading || !isGuest) return null

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
