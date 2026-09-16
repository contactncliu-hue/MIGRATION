import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import type { ServerInfoField } from '../../types/panels'

// Field keys in the DB stay the same ('languages' / 'territory')
// — only the display labels changed, so no migration/schema change needed.
// 'diplomacy' has been removed entirely from this panel.
const LABELS: Record<string, string> = {
  languages: 'Member Geography',
  territory: 'Territories and Armories',
}

// `languages` content is stored as a JSON array string, e.g. '["Luzon","Visayas"]'.
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
  const [savingField, setSavingField] = useState<string | null>(null)

  // Local drafts for the free-text fields, so typing doesn't save until "Save" is clicked.
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [hasSeeded, setHasSeeded] = useState(false)

  const load = async () => {
    const { data, error } = await supabase.from('server_info').select('*')
    if (error) {
      console.error('Failed to load server info:', error.message)
      return
    }
    setRows(data ?? [])
    if (!hasSeeded) {
      const seeded: Record<string, string> = {}
      seeded.territory = (data ?? []).find((r) => r.field === 'territory')?.content ?? ''
      setDrafts(seeded)
      setHasSeeded(true)
    }
  }
  useEffect(() => { load() }, [])

  const save = async (field: string, content: string) => {
    setSavingField(field)
    const { error } = await supabase.from('server_info').upsert({ field, content }, { onConflict: 'field' })
    setSavingField(null)
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
      {/* Member Geography (formerly "Languages spoken"): add/remove pills */}
      <div style={{ marginBottom: 16 }}>
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
              placeholder="Add a location"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addLanguage()}
            />
            <button onClick={addLanguage} disabled={savingField === 'languages'}>Add</button>
          </div>
        )}
      </div>

      {/* Territories and Armories: free text with an explicit Save button */}
      {['territory'].map((f) => {
        const row = rows.find((r) => r.field === f)
        return (
          <div key={f} style={{ marginBottom: 16 }}>
            <strong>{LABELS[f]}</strong>
            {isAdmin ? (
              <div>
                <textarea
                  value={drafts[f] ?? ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [f]: e.target.value }))}
                  style={{ width: '100%', minHeight: 40, display: 'block', marginTop: 6 }}
                />
                <button
                  onClick={() => save(f, drafts[f] ?? '')}
                  disabled={savingField === f}
                  style={{ marginTop: 6 }}
                >
                  {savingField === f ? 'Saving…' : 'Save'}
                </button>
              </div>
            ) : (
              <p>{row?.content || '—'}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
