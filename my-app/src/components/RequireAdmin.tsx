import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'

/**
 * Route-level admin gate. This is a UX guard only — the real boundary is
 * Supabase RLS, since anyone can call the REST API with the anon key.
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading, user } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />

  return <>{children}</>
}
