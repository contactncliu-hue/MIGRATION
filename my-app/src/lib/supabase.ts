import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True when the deploy is missing its Supabase credentials. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
      'Locally: copy .env.example to .env. On Vercel: Settings → Environment Variables.'
  )
}

/**
 * createClient throws on an empty URL, which would blank the whole app before
 * anything renders. A placeholder keeps the shell up so the misconfiguration
 * is visible and navigable instead of a white screen — every query then fails
 * on its own and surfaces through the usual error paths.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
)
