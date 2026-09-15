import { createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'
import type { UserProfile, UserRole } from '../types/user'

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  role: UserRole
  isAdmin: boolean
  isGuest: boolean
  /** True until the first session + profile resolution finishes. */
  loading: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
