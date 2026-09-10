import './Sidebar.css'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { translations, languageOptions } from '../lib/translations'
import type { LanguageCode, UserProfile } from '../types/user'
import './Sidebar.css'

interface SidebarProps {
  isOpen: boolean
}

export function Sidebar({ isOpen }: SidebarProps) {
  const [profile, setProfile] = useState<UserProfile>({ displayName: 'Member', role: 'guest' })
  const [lang, setLang] = useState<LanguageCode>(
    (localStorage.getItem('zoo_lang') as LanguageCode) || 'en'
  )
  const [loggingOut, setLoggingOut] = useState(false)

  const dict = translations[lang]

  useEffect(() => {
    let cancelled = false

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user || cancelled) return

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('profiles lookup failed:', error)
        return
      }
      if (cancelled) return

      setProfile({
        displayName: data?.display_name || (user.email ?? 'Member').split('@')[0],
        role: (data?.role?.toLowerCase() as UserProfile['role']) || 'guest',
      })
    })

    return () => {
      cancelled = true
    }
  }, [])

  function handleLangChange(next: LanguageCode) {
    setLang(next)
    localStorage.setItem('zoo_lang', next)
  }

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Sign out failed:', err)
    }
    window.location.href = '/login'
  }

  const initial = profile.displayName.charAt(0).toUpperCase()
  const isAdmin = profile.role === 'admin'

  return (
    <aside className={`sidebar ${isOpen ? '' : 'sidebar-hidden'}`}>
      <div className="welcome-block">
        <div className={`user-avatar ${isAdmin ? 'admin' : ''}`}>
          <span>{isAdmin ? 'A' : initial}</span>
        </div>
        <div className="welcome-text">
          <div className="welcome-label">{dict.welcome}</div>
          <div className="user-name">{profile.displayName}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          {dict.homepage}
        </NavLink>
        <NavLink to="/transfer" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          {dict.transfer}
        </NavLink>
        {profile.role === 'admin' && (
  <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
    ADMIN & MANAGEMENT
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