import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { translations, languageOptions } from '../lib/translations'
import type { LanguageCode } from '../types/user'
import './Sidebar.css'

interface SidebarProps {
  isOpen: boolean
}

export function Sidebar({ isOpen }: SidebarProps) {
  const { profile, isAdmin, isGuest, signOut } = useAuth()
  const navigate = useNavigate()
  const [lang, setLang] = useState<LanguageCode>(
    (localStorage.getItem('zoo_lang') as LanguageCode) || 'en'
  )
  const [loggingOut, setLoggingOut] = useState(false)

  const dict = translations[lang]
  const displayName = profile?.displayName ?? 'Guest'

  // Drives the sidebar's per-language display font (see fonts.css).
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

  const initial = displayName.charAt(0).toUpperCase()

  return (
    <aside className={`sidebar ${isOpen ? '' : 'sidebar-hidden'}`}>
      <div className="welcome-block">
        <div className={`user-avatar ${isAdmin ? 'admin' : ''} ${isGuest ? 'guest' : ''}`}>
          {isGuest ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.1 0-7.5 2.3-7.5 5.2V21h15v-1.8c0-2.9-3.4-5.2-7.5-5.2Z"
                fill="currentColor"
              />
            </svg>
          ) : (
            <span>{isAdmin ? 'A' : initial}</span>
          )}
        </div>
        <div className="welcome-text">
          <div className="welcome-label">{isGuest ? dict.browsing : dict.welcome}</div>
          <div className="user-name">{isGuest ? dict.guest : displayName}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          {dict.homepage}
        </NavLink>
        <NavLink to="/transfer" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          {dict.transfer}
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            ADMIN &amp; MANAGEMENT
          </NavLink>
        )}
      </nav>

      <div className="sidebar-bottom">
        {isGuest ? (
          <button className="login-btn" onClick={() => navigate('/login')}>
            {dict.login}
          </button>
        ) : (
          <button className="logout-btn" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? dict.loggingOut : dict.logout}
          </button>
        )}
        <select
          className="lang-select"
          value={lang}
          onChange={(e) => handleLangChange(e.target.value as LanguageCode)}
        >
          {languageOptions.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </aside>
  )
}
