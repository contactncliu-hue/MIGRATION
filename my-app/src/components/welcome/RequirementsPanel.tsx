import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import type { ServerInfoField } from '../../types/panels'

const LABELS: Record<string, string> = {
  languages: 'Languages spoken',
  territory: 'Territory sharing',
  diplomacy: 'Diplomacy',
}

// `languages` content is stored as a JSON array string, e.g. '["English","Tagalog"]'.
// Falls back to comma-splitting in case older rows still hold plain comma text.
function parseList(content: string | undefined): string[] {
  if (!content) return []
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === 'string')
  } catch {
    // not JSON — treat as legacy comma-separated text
  }
  return content.split(',').map((s) => s.trim()).filter(Boolean)
}

export function ServerInfoPanel() {
  const { isAdmin } = useAuth()
  const [rows, setRows] = useState<ServerInfoField[]>([])
  const [newLanguage, setNewLanguage] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  const load = async () => {
    const { data, error } = await supabase.from('server_info').select('*')
    if (error) {
      console.error('Failed to load server info:', error.message)
      return
    }
    setRows(data ?? [])
  }
  useEffect(() => { load() }, [])

  const save = async (field: string, content: string) => {
    setSaving(field)
    const { error } = await supabase.from('server_info').upsert({ field, content }, { onConflict: 'field' })
    setSaving(null)
    if (error) {
      console.error(`Failed to save ${field}:`, error.message)
      alert(`Could not save ${LABELS[field] ?? field}: ${error.message}`)
      return
    }
    load()
  }

  const languagesRow = rows.find((r) => r.field === 'languages')
  const languages = parseList(languagesRow?.content)

  const addLanguage = async () => {
    const val = newLanguage.trim()
    if (!val || languages.includes(val)) return
    await save('languages', JSON.stringify([...languages, val]))
    setNewLanguage('')
  }

  const removeLanguage = async (lang: string) => {
    await save('languages', JSON.stringify(languages.filter((l) => l !== lang)))
  }

  return (
    <div>
      {/* Languages spoken: add/remove chips */}
      <div style={{ marginBottom: 12 }}>
        <strong>{LABELS.languages}</strong>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
          {languages.map((lang) => (
            <span
              key={lang}
              className="pill"
              style={{ background: '#5b7db1', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {lang}
              {isAdmin && (
                <button onClick={() => removeLanguage(lang)} style={{ marginLeft: 2 }}>×</button>
              )}
            </span>
          ))}
          {languages.length === 0 && <p style={{ margin: 0, color: '#888' }}>—</p>}
        </div>
        {isAdmin && (
          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
            <input
              placeholder="Add a language"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addLanguage()}
            />
            <button onClick={addLanguage} disabled={saving === 'languages'}>Add</button>
          </div>
        )}
      </div>

      {/* Territory sharing / Diplomacy: unchanged free-text fields */}
      {['territory', 'diplomacy'].map((f) => {
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
