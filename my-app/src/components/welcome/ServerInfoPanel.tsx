import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import type { ServerInfoField } from '../../types/panels'

const LABELS: Record<string, string> = {
  languages: 'Languages spoken', territory: 'Territory sharing', diplomacy: 'Diplomacy',
}

export function ServerInfoPanel() {
  const { isAdmin } = useAuth()
  const [rows, setRows] = useState<ServerInfoField[]>([])

  const load = async () => {
    const { data } = await supabase.from('server_info').select('*')
    setRows(data ?? [])
  }
  useEffect(() => { load() }, [])

  const save = async (field: string, content: string) => {
    await supabase.from('server_info').upsert({ field, content }, { onConflict: 'field' })
    load()
  }

  return (
    <div>
      {['languages', 'territory', 'diplomacy'].map((f) => {
        const row = rows.find((r) => r.field === f)
        return (
          <div key={f} style={{ marginBottom: 12 }}>
            <strong>{LABELS[f]}</strong>
            {isAdmin ? (
              <textarea
                defaultValue={row?.content ?? ''}
                onBlur={(e) => save(f, e.target.value)}
                style={{ width: '100%', minHeight: 40 }}
              />
            ) : (
              <p>{row?.content || '—'}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
