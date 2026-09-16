import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import type { AdditionalInfoItem } from '../../types/panels'

type Section = 'contact' | 'migration_exception'

const SECTION_TITLE: Record<Section, string> = {
  contact: 'For more inquiries, contact:',
  migration_exception: 'Migration Exceptions',
}

export function AdditionalInfoPanel() {
  const { isAdmin } = useAuth()
  const [items, setItems] = useState<AdditionalInfoItem[]>([])

  const load = async () => {
    const { data, error } = await supabase.from('additional_info').select('*').order('sort_order')
    if (error) {
      console.error('Failed to load additional info:', error.message)
      return
    }
    setItems(data ?? [])
  }
  useEffect(() => { load() }, [])

  const remove = async (id: string) => {
    const { error } = await supabase.from('additional_info').delete().eq('id', id)
    if (error) {
      console.error('Failed to remove item:', error.message)
      alert(`Could not remove item: ${error.message}`)
      return
    }
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

  const contactItems = items.filter((i) => i.section === 'contact')
  const exceptionItems = items.filter((i) => i.section === 'migration_exception')

  return (
    <div>
      {/* --- Contact: fully separate section from Migration Exceptions --- */}
      <p>{SECTION_TITLE.contact}</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{contactItems.map(renderItem)}</div>
      {isAdmin && (
        <AddForm section="contact" sortOrder={contactItems.length} onAdded={load} />
      )}

      {/* --- Migration Exceptions: its own section with its own form --- */}
      <h3 style={{ marginTop: 20 }}>{SECTION_TITLE.migration_exception}</h3>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{exceptionItems.map(renderItem)}</div>
      {isAdmin && (
        <AddForm section="migration_exception" sortOrder={exceptionItems.length} onAdded={load} />
      )}
    </div>
  )
}

function AddForm({
  section,
  sortOrder,
  onAdded,
}: {
  section: Section
  sortOrder: number
  onAdded: () => void
}) {
  const [label, setLabel] = useState('')
  const [emph, setEmph] = useState(false)
  const [saving, setSaving] = useState(false)

  const add = async () => {
    const trimmed = label.trim()
    if (!trimmed) return
    setSaving(true)
    const { error } = await supabase.from('additional_info').insert({
      section,
      label: trimmed,
      is_emphasized: emph,
      sort_order: sortOrder,
    })
    setSaving(false)

    if (error) {
      console.error(`Failed to add ${section} item:`, error.message)
      alert(`Could not save "${trimmed}": ${error.message}`)
      return
    }
    setLabel('')
    setEmph(false)
    onAdded()
  }

  return (
    <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
      <input
        placeholder="Name / label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && add()}
      />
      <label>
        <input type="checkbox" checked={emph} onChange={(e) => setEmph(e.target.checked)} /> Bold/emphasized
      </label>
      <button onClick={add} disabled={saving}>{saving ? 'Adding…' : 'Add'}</button>
    </div>
  )
}
