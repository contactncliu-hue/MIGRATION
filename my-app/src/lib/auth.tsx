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

    // onAuthStateChange fires once on subscribe with the restored session,
    // so it covers the initial load too — no separate getUser() call needed.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null

      if (!nextUser) {
        if (cancelled) return
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      setUser(nextUser)
      fetchProfile(nextUser).then((p) => {
        if (cancelled) return
        setProfile(p)
        setLoading(false)
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
