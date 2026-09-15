import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import type { AdditionalInfoItem } from '../../types/panels'

export function AdditionalInfoPanel() {
  const { isAdmin } = useAuth()
  const [items, setItems] = useState<AdditionalInfoItem[]>([])
  const [label, setLabel] = useState('')
  const [section, setSection] = useState<'contact' | 'migration_exception'>('contact')
  const [emph, setEmph] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('additional_info').select('*').order('sort_order')
    setItems(data ?? [])
  }
  useEffect(() => { load() }, [])

  const add = async () => {
    if (!label.trim()) return
    await supabase.from('additional_info').insert({
      section, label, is_emphasized: emph, sort_order: items.length,
    })
    setLabel('')
    load()
  }
  const remove = async (id: string) => {
    await supabase.from('additional_info').delete().eq('id', id)
    load()
  }

  const renderItem = (item: AdditionalInfoItem) => (
    <span
      key={item.id}
      className="pill"
      style={{
        background: item.section === 'contact' ? '#333' : '#5b7db1',
        fontWeight: item.is_emphasized ? 800 : 700,
        fontSize: item.is_emphasized ? '1.1em' : undefined,
        color: item.is_emphasized ? '#c9660a' : '#fff',
      }}
    >
      {item.label}
      {isAdmin && <button onClick={() => remove(item.id)} style={{ marginLeft: 6 }}>×</button>}
    </span>
  )

  return (
    <div>
      <p>For more inquiries, contact:</p>
      <div>{items.filter((i) => i.section === 'contact').map(renderItem)}</div>

      <h3 style={{ marginTop: 16 }}>Migration Exceptions</h3>
      <div>{items.filter((i) => i.section === 'migration_exception').map(renderItem)}</div>

      {isAdmin && (
        <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <select value={section} onChange={(e) => setSection(e.target.value as any)}>
            <option value="contact">Contact</option>
            <option value="migration_exception">Migration Exception</option>
          </select>
          <input placeholder="Name / label" value={label} onChange={(e) => setLabel(e.target.value)} />
          <label><input type="checkbox" checked={emph} onChange={(e) => setEmph(e.target.checked)} /> Bold/emphasized</label>
          <button onClick={add}>Add</button>
        </div>
      )}
    </div>
  )
}
