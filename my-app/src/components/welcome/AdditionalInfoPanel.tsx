import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import { useLanguage } from '../../lib/language-context'
import { TranslatedText } from '../ui/TranslatedText'
import type { AdditionalInfoItem } from '../../types/panels'

type Section = 'contact' | 'migration_exception'

export function AdditionalInfoPanel() {
  const { isAdmin } = useAuth()
  const { dict } = useLanguage()
  const SECTION_TITLE: Record<Section, string> = {
    contact: dict.contactInquiry,
    migration_exception: dict.migrationExceptions,
  }
  const [items, setItems] = useState<AdditionalInfoItem[]>([])
  const [note, setNote] = useState('')
  const [noteDraft, setNoteDraft] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)

  const load = async () => {
    const { data, error } = await supabase.from('additional_info').select('*').order('sort_order')
    if (error) {
      console.error('Failed to load additional info:', error.message)
      return
    }
    setItems(data ?? [])
  }

  const loadNote = async () => {
    const { data, error } = await supabase
      .from('server_info')
      .select('content')
      .eq('field', 'migration_exception_note')
      .maybeSingle()
    if (error) {
      console.error('Failed to load migration exception note:', error.message)
      return
    }
    setNote(data?.content ?? '')
    setNoteDraft(data?.content ?? '')
  }

  useEffect(() => { load(); loadNote() }, [])

  const saveNote = async () => {
    setNoteSaving(true)
    const { error } = await supabase
      .from('server_info')
      .upsert({ field: 'migration_exception_note', content: noteDraft }, { onConflict: 'field' })
    setNoteSaving(false)
    if (error) {
      console.error('Failed to save note:', error.message)
      alert(`Could not save note: ${error.message}`)
      return
    }
    setNote(noteDraft)
  }

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
      <TranslatedText text={item.label} />
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
        <AddForm section="contact" sortOrder={contactItems.length} onAdded={load} addLabel={dict.addLabel} />
      )}

      {/* --- Migration Exceptions: its own section with its own form --- */}
      <h3 style={{ marginTop: 20, marginBottom: 2 }}>{SECTION_TITLE.migration_exception}</h3>
      <p style={{ margin: '0 0 8px', fontSize: '0.85em', color: '#666' }}>
        {dict.reasonableExceptionsNote}
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{exceptionItems.map(renderItem)}</div>
      {isAdmin && (
        <AddForm section="migration_exception" sortOrder={exceptionItems.length} onAdded={load} addLabel={dict.addLabel} />
      )}

      {/* Small note below the Migration Exceptions group */}
      <div style={{ marginTop: 12 }}>
        {isAdmin ? (
          <div>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Add a note about migration exceptions…"
              style={{ width: '100%', minHeight: 32, display: 'block', fontSize: '0.85em' }}
            />
            <button onClick={saveNote} disabled={noteSaving} style={{ marginTop: 6 }}>
              {noteSaving ? dict.savingWelcomeLabel : dict.saveLabel}
            </button>
          </div>
        ) : (
          note && (
            <p style={{ fontSize: '0.85em', color: '#666', margin: '4px 0 0' }}>
              <TranslatedText text={note} />
            </p>
          )
        )}
      </div>
    </div>
  )
}

function AddForm({
  section,
  sortOrder,
  onAdded,
  addLabel,
}: {
  section: Section
  sortOrder: number
  onAdded: () => void
  addLabel: string
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
      <button onClick={add} disabled={saving}>{saving ? '…' : addLabel}</button>
    </div>
  )
}
