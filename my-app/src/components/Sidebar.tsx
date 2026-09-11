import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { translations, languageOptions } from '../lib/translations'
import type { LanguageCode } from '../types/user'
import './Sidebar.css'

interface SidebarProps {
  isOpen: boolean
}

const ICONS = {
  home: 'M12 3.2 3.6 10v10.2h6v-6h4.8v6h6V10L12 3.2Z',
  migration: 'M4 12h11.2M11.6 7.6 16 12l-4.4 4.4M18.4 4.8v14.4',
  admin: 'M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Zm8.2 3.4a8 8 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a8 8 0 0 0-2-1.2l-.3-2.5H9.5l-.4 2.5a8 8 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5a8 8 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a8 8 0 0 0 2 1.2l.4 2.5h5l.4-2.5a8 8 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.05-.4.1-.8.1-1.2Z',
  language: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0c2.4 2.4 3.6 5.4 3.6 9s-1.2 6.6-3.6 9c-2.4-2.4-3.6-5.4-3.6-9S9.6 5.4 12 3ZM3.4 9.6h17.2M3.4 14.4h17.2',
} as const

function RowIcon({ path, filled }: { path: string; filled?: boolean }) {
  return (
    <span className="zoo-sb-row-icon">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d={path}
          fill={filled ? 'currentColor' : 'none'}
          stroke={filled ? 'none' : 'currentColor'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export function Sidebar({ isOpen }: SidebarProps) {
  const { profile, isAdmin, isGuest, signOut } = useAuth()
  const navigate = useNavigate()
  const [lang, setLang] = useState<LanguageCode>(
    () => (localStorage.getItem('zoo_lang') as LanguageCode) || 'en'
  )
  const [loggingOut, setLoggingOut] = useState(false)

  const dict = translations[lang]
  const displayName = profile?.displayName ?? dict.guest
  const initial = displayName.charAt(0).toUpperCase()
  const currentLang = languageOptions.find((o) => o.code === lang)?.label ?? 'English'

  // Drives the per-language display font (see styles/fonts.css).
  useEffect(() => {
    document.documentElement.setAttribute('data-lang', lang)
  }, [lang])

  function handleLangChange(next: LanguageCode) {
    setLang(next)
    localStorage.setItem('zoo_lang', next)
  }

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await signOut()
    } catch (err) {
      console.error('Sign out failed:', err)
    }
    window.location.href = '/login'
  }

  const rowClass = ({ isActive }: { isActive: boolean }) =>
    `zoo-sb-row ${isActive ? 'is-active' : ''}`

  return (
    <aside className={`sidebar ${isOpen ? '' : 'sidebar-hidden'}`}>
      <div className="zoo-sb-head">
        <div
          className={`zoo-sb-avatar ${isAdmin ? 'is-admin' : ''} ${isGuest ? 'is-guest' : ''}`}
        >
          {isGuest ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.1 0-7.5 2.3-7.5 5.2V21h15v-1.8c0-2.9-3.4-5.2-7.5-5.2Z"
                fill="currentColor"
              />
            </svg>
          ) : (
            <span>{initial}</span>
          )}
        </div>

        <div className="zoo-sb-id">
          <span className="zoo-sb-id-cap">{isGuest ? dict.browsing : dict.welcome}</span>
          <span className="zoo-sb-id-name">
            {displayName}
            {isAdmin && <em className="zoo-sb-role">{dict.admin}</em>}
          </span>
        </div>
      </div>

      <nav className="zoo-sb-nav">
        <NavLink to="/" className={rowClass} end>
          <RowIcon path={ICONS.home} filled />
          <span className="zoo-sb-row-label">{dict.homepage}</span>
        </NavLink>

        <NavLink to="/transfer" className={rowClass}>
          <RowIcon path={ICONS.migration} />
          <span className="zoo-sb-row-label">{dict.transfer}</span>
        </NavLink>

        {isAdmin && (
          <NavLink to="/admin" className={rowClass}>
            <RowIcon path={ICONS.admin} filled />
            <span className="zoo-sb-row-label">{dict.admin}</span>
          </NavLink>
        )}
      </nav>

      <div className="zoo-sb-rule" />

      <label className="zoo-sb-row zoo-sb-row--quiet">
        <RowIcon path={ICONS.language} />
        <span className="zoo-sb-row-label">{dict.language}</span>
        <span className="zoo-sb-row-value">{currentLang}</span>
        <select
          className="zoo-sb-lang"
          value={lang}
          aria-label={dict.language}
          onChange={(e) => handleLangChange(e.target.value as LanguageCode)}
        >
          {languageOptions.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      {/* Decorative only — no text sits on it, so it can be cropped freely. */}
      <div className="zoo-sb-art" aria-hidden="true" />

      <div className="zoo-sb-foot">
        {isGuest ? (
          <button
            className="zoo-sb-action zoo-sb-action--login"
            onClick={() => navigate('/login')}
          >
            {dict.login}
          </button>
        ) : (
          <button
            className="zoo-sb-action zoo-sb-action--logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? dict.loggingOut : dict.logout}
          </button>
        )}
      </div>
    </aside>
  )
}
