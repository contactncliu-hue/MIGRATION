import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { translations, languageOptions } from '../lib/translations'
import type { LanguageCode } from '../types/user'
import './Sidebar.css'

interface SidebarProps {
  isOpen: boolean
}

export function Sidebar({ isOpen }: SidebarProps) {
  const { profile, isAdmin, signOut } = useAuth()
  const [lang, setLang] = useState<LanguageCode>(
    (localStorage.getItem('zoo_lang') as LanguageCode) || 'en'
  )
  const [loggingOut, setLoggingOut] = useState(false)

  const dict = translations[lang]
  const displayName = profile?.displayName ?? 'Guest'

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
        <div className={`user-avatar ${isAdmin ? 'admin' : ''}`}>
          <span>{isAdmin ? 'A' : initial}</span>
        </div>
        <div className="welcome-text">
          <div className="welcome-label">{dict.welcome}</div>
          <div className="user-name">{displayName}</div>
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
        <button className="logout-btn" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? dict.loggingOut : dict.logout}
        </button>
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
