import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import { useLanguage } from '../../lib/language-context'
import { TranslatedText } from '../ui/TranslatedText'
import type { RequirementRow } from '../../types/panels'

export function RequirementsPanel() {
  const { isAdmin } = useAuth()
  const { dict } = useLanguage()
  const [rows, setRows] = useState<RequirementRow[]>([])
  const [text, setText] = useState('')

  const load = async () => {
    const { data } = await supabase.from('server_requirements').select('*').order('sort_order')
    setRows(data ?? [])
  }
  useEffect(() => { load() }, [])

  const add = async () => {
    if (!text.trim()) return
    await supabase.from('server_requirements').insert({
      row_number: rows.length + 1, content: text, sort_order: rows.length,
    })
    setText('')
    load()
  }
  const remove = async (id: string) => {
    await supabase.from('server_requirements').delete().eq('id', id)
    load()
  }

  return (
    <div>
      {rows.map((r, i) => (
        <div key={r.id} className="pill" style={{ background: '#5b7db1', display: 'flex', gap: 8 }}>
          {i + 1}. <TranslatedText text={r.content} />
          {isAdmin && <button onClick={() => remove(r.id)} style={{ marginLeft: 6 }}>×</button>}
        </div>
      ))}
      {isAdmin && (
        <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="New requirement" />
          <button onClick={add}>{dict.addLabel}</button>
        </div>
      )}
    </div>
  )
}
