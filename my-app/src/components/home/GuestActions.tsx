import { useState } from 'react'
import { useAuth } from '../../lib/auth-context'
import { translations } from '../../lib/translations'
import type { LanguageCode } from '../../types/user'
import { MigrationFormModal } from '../transfer/MigrationFormModal'
import { UidLookupModal } from '../transfer/UidLookupModal'

/**
 * Why a visitor without an account is here: to apply for a migration, or to
 * check one they already sent. Both live behind the Transfer page's hamburger
 * otherwise, which is two taps past the reason they came.
 *
 * Signed-in members already know the way around, so this only shows for guests.
 */
export function GuestActions() {
  const { isGuest } = useAuth()
  const [applyOpen, setApplyOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  // Same key the sidebar writes, so the two stay in step without extra state.
  const lang = (localStorage.getItem('zoo_lang') as LanguageCode) || 'en'
  const dict = translations[lang] ?? translations.en

  if (!isGuest) return null

  return (
    <>
      <div className="home-guest-actions">
        <button type="button" className="home-guest-primary" onClick={() => setApplyOpen(true)}>
          {dict.applyCta}
        </button>
        <button type="button" className="home-guest-secondary" onClick={() => setStatusOpen(true)}>
          {dict.statusCta}
        </button>
      </div>

      {applyOpen && <MigrationFormModal onClose={() => setApplyOpen(false)} />}
      {statusOpen && <UidLookupModal onClose={() => setStatusOpen(false)} />}
    </>
  )
}
