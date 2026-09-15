import { useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { AuthContext, type AuthState } from './auth-context'
import type { UserProfile, UserRole } from '../types/user'

function normalizeRole(raw: unknown): UserRole {
  const value = String(raw ?? '').toLowerCase()
  return value === 'admin' || value === 'member' ? value : 'guest'
}

async function fetchProfile(user: User): Promise<UserProfile> {
  const fallbackName = (user.email ?? 'Member').split('@')[0]

  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, role')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('profiles lookup failed:', error)
    return { displayName: fallbackName, role: 'guest' }
  }

  return {
    displayName: data?.display_name || fallbackName,
    role: normalizeRole(data?.role),
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    // getSession() is the authoritative initial check — unlike the first
    // onAuthStateChange callback, it's a promise that actually waits for
    // the persisted session to finish being read from storage. That read
    // can take an extra tick on mobile, where onAuthStateChange's first
    // callback was firing with session = null (restore not done yet)
    // before firing again moments later with the real session — flipping
    // loading to false too early and causing guest-only UI to flash
    // visible, then disappear once the real (logged-in) state arrived.
    // getSession() up front avoids that: loading only goes false once,
    // after the real state is known.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      const initialUser = session?.user ?? null
      setUser(initialUser)

      if (!initialUser) {
        setProfile(null)
        setLoading(false)
        return
      }

      fetchProfile(initialUser).then((p) => {
        if (cancelled) return
        setProfile(p)
        setLoading(false)
      })
    })

    // Now just for live updates after the initial load — sign-in,
    // sign-out, token refresh while the app is open. Deliberately does
    // not touch `loading`: that's fully owned by the getSession() check
    // above, so a live update can't re-introduce the same premature
    // "loading finished" race.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)

      if (!nextUser) {
        setProfile(null)
        return
      }

      fetchProfile(nextUser).then((p) => {
        if (cancelled) return
        setProfile(p)
      })
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthState>(() => {
    const role = profile?.role ?? 'guest'
    return {
      user,
      profile,
      role,
      isAdmin: role === 'admin',
      isGuest: !user,
      loading,
      signOut: async () => {
        await supabase.auth.signOut()
      },
    }
  }, [user, profile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
