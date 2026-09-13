import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { translations } from '../../lib/translations'
import { Modal } from '../ui/Modal'
import { Field } from '../ui/Field'
import { FormMessage } from '../ui/FormMessage'
import type { LanguageCode } from '../../types/user'

interface UidLookupModalProps {
  onClose: () => void
}

/** Lets a member check their own migration status by UID, without signing in. */
export function UidLookupModal({ onClose }: UidLookupModalProps) {
  const lang = (localStorage.getItem('zoo_lang') as LanguageCode) || 'en'
  const dict = translations[lang] ?? translations.en

  const [uid, setUid] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ text: string; cls: string } | null>(null)
  const [searching, setSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus the input as soon as the dialog mounts.
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 0)
    return () => clearTimeout(t)
  }, [])

  function statusLabel(statusKey: string) {
    if (statusKey === 'approved') return dict.statusApproved
    if (statusKey === 'rejected') return dict.statusRejected
    return dict.statusPending
  }

  async function runLookup() {
    setError('')
    setResult(null)

    if (!uid.trim()) {
      setError(dict.errorEnterUid)
      return
    }

    setSearching(true)
    try {
      const { data, error: queryError } = await supabase
        .from('migration_members')
        .select('status, created_at')
        .eq('uid', uid.trim())
        .order('created_at', { ascending: false })
        .limit(1)
      if (queryError) throw queryError

      const row = data?.[0]
      if (!row) {
        setError(dict.errorNoRequestFound)
        return
      }

      const statusKey = (row.status || 'pending').toLowerCase()
      setResult({ text: statusLabel(statusKey), cls: `status-${statusKey}` })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={dict.checkStatusModalTitle}
      subtitle={dict.checkStatusModalSubtitle}
    >
      <Field
        label={dict.uidLabel}
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={21}
        placeholder={dict.uidPlaceholderExample}
        value={uid}
        onChange={(e) => setUid(e.target.value.replace(/[^0-9]/g, '').slice(0, 21))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            runLookup()
          }
        }}
      />

      <button type="button" className="submit-btn" disabled={searching} onClick={runLookup}>
        {searching ? dict.searchingLabel : dict.searchLabel}
      </button>

      <FormMessage tone="error">{error}</FormMessage>
      {result && <div className={`uid-lookup-result visible ${result.cls}`}>{result.text}</div>}
    </Modal>
  )
}
