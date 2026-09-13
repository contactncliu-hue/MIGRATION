import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../lib/language-context'
import {
  FACTION_LETTERS,
  emptyMember,
  type Faction,
  type MemberDraft,
  type TransferType,
} from '../../lib/migration'
import { Modal } from '../ui/Modal'
import { Field, FieldRow } from '../ui/Field'
import { FormMessage } from '../ui/FormMessage'

interface MigrationFormModalProps {
  onClose: () => void
}

const ROLE_OPTIONS = Array.from({ length: 10 }, (_, i) => `i${i + 1}`)

/** Solo or group migration request form. Owns its own draft state. */
export function MigrationFormModal({ onClose }: MigrationFormModalProps) {
  const { dict } = useLanguage()

  const [transferType, setTransferType] = useState<TransferType>('solo')
  const [allianceTag, setAllianceTag] = useState('')
  const [members, setMembers] = useState<MemberDraft[]>([emptyMember()])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateMember(idx: number, patch: Partial<MemberDraft>) {
    setMembers((prev) => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)))
  }

  function cycleFaction(idx: number) {
    setMembers((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, faction: ((m.faction + 1) % 4) as Faction } : m))
    )
  }

  function removeMember(idx: number) {
    setMembers((prev) => prev.filter((_, i) => i !== idx))
  }

  function handleTypeChange(type: TransferType) {
    setTransferType(type)
    if (type === 'solo') setMembers((prev) => [prev[0] || emptyMember()])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (transferType === 'group' && !allianceTag.trim()) {
      setError(dict.errorFillAllianceTag)
      return
    }

    const missing = members.some(
      (m) =>
        !m.uid || !m.username || !m.prevAlliance || !m.prevServer ||
        !m.killcount || !m.faction || !m.role || !m.f1Power
    )
    if (missing) {
      setError(dict.errorFillAllFields)
      return
    }

    setSubmitting(true)
    try {
      const memberPayload = members.map((m) => ({
        uid: m.uid,
        username: m.username,
        previous_alliance: m.prevAlliance,
        previous_server: m.prevServer,
        kill_count: m.killcount ? `${m.killcount}M` : '',
        faction: FACTION_LETTERS[m.faction],
        role: m.role,
        migration_score: m.migrationScore ? Number(m.migrationScore) : null,
        f1_power: Number(m.f1Power),
        f2_power: m.f2Power ? Number(m.f2Power) : null,
      }))

      const { data: reqData, error: reqError } = await supabase
        .from('migration_requests')
        .insert({ type: transferType, alliance_tag: allianceTag.trim() || null })
        .select()
        .single()
      if (reqError) throw reqError

      const { error: membersError } = await supabase
        .from('migration_members')
        .insert(memberPayload.map((m) => ({ ...m, request_id: reqData.id })))
      if (membersError) throw membersError

      setSuccess('Migration request sent!')
      setTimeout(onClose, 1200)
    } catch (err) {
      console.error('Migration submit failed:', err)
      let message = 'Something went wrong.'
      try {
        message = JSON.stringify(err, null, 2)
      } catch {
        message = String(err)
      }
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const isGroup = transferType === 'group'

  return (
    <Modal
      open
      onClose={onClose}
      title={dict.migrationModalTitle}
      subtitle={dict.migrationModalSubtitle}
    >
      <div className="transfer-type-toggle">
        <button
          type="button"
          className={`type-btn ${!isGroup ? 'active' : ''}`}
          onClick={() => handleTypeChange('solo')}
        >
          {dict.soloTransferBtn}
        </button>
        <button
          type="button"
          className={`type-btn ${isGroup ? 'active' : ''}`}
          onClick={() => handleTypeChange('group')}
        >
          {dict.groupTransferBtn}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {isGroup && (
          <Field
            label={dict.groupNameLabel}
            type="text"
            placeholder={dict.groupNamePlaceholder}
            value={allianceTag}
            onChange={(e) => setAllianceTag(e.target.value)}
          />
        )}

        {members.map((m, idx) => (
          <div className="member-row" key={idx}>
            {isGroup && (
              <div className="member-row-header">
                <span>{dict.memberLabel.toUpperCase()} #{idx + 1}</span>
                {members.length > 1 && (
                  <button
                    type="button"
                    className="remove-member-btn"
                    onClick={() => removeMember(idx)}
                  >
                    {dict.removeMember}
                  </button>
                )}
              </div>
            )}

            <Field
              label={dict.uidLabel}
              type="text"
              inputMode="numeric"
              maxLength={21}
              value={m.uid}
              onChange={(e) =>
                updateMember(idx, { uid: e.target.value.replace(/[^0-9]/g, '').slice(0, 21) })
              }
            />
            <Field
              label={dict.usernameLabel}
              type="text"
              value={m.username}
              onChange={(e) => updateMember(idx, { username: e.target.value })}
            />

            <FieldRow>
              <Field
                label={dict.prevAllianceLabel}
                type="text"
                value={m.prevAlliance}
                onChange={(e) => updateMember(idx, { prevAlliance: e.target.value })}
              />
              <Field
                label={dict.prevServerLabel}
                type="text"
                placeholder={dict.prevServerPlaceholder}
                value={m.prevServer}
                onChange={(e) => updateMember(idx, { prevServer: e.target.value })}
              />
            </FieldRow>

            <Field
              label={dict.killCountLabel}
              type="text"
              inputMode="numeric"
              placeholder={dict.killCountPlaceholder}
              value={m.killcount ? `${m.killcount}M` : ''}
              onChange={(e) =>
                updateMember(idx, { killcount: e.target.value.replace(/[^0-9]/g, '') })
              }
            />

            <FieldRow className="faction-role-row">
              <div className="faction-picker">
                <label>{dict.faction}</label>
                <button
                  type="button"
                  className="faction-btn"
                  data-state={m.faction}
                  onClick={() => cycleFaction(idx)}
                >
                  <span className="faction-letter">{FACTION_LETTERS[m.faction]}</span>
                </button>
              </div>
              <Field label={dict.roleLabel}>
                <select
                  value={m.role}
                  onChange={(e) => updateMember(idx, { role: e.target.value })}
                >
                  <option value="">--</option>
                  {ROLE_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
            </FieldRow>

            <Field
              label={dict.migrationScoreLabel}
              type="text"
              inputMode="numeric"
              value={m.migrationScore}
              onChange={(e) => updateMember(idx, { migrationScore: e.target.value })}
            />
            <Field
              label={dict.f1PowerLabel}
              type="text"
              inputMode="numeric"
              required
              value={m.f1Power}
              onChange={(e) => updateMember(idx, { f1Power: e.target.value })}
            />
            <Field
              label={dict.f2PowerLabel}
              type="text"
              inputMode="numeric"
              value={m.f2Power}
              onChange={(e) => updateMember(idx, { f2Power: e.target.value })}
            />
          </div>
        ))}

        {isGroup && (
          <button
            type="button"
            className="add-member-btn"
            onClick={() => setMembers((prev) => [...prev, emptyMember()])}
          >
            {dict.addMemberBtn}
          </button>
        )}

        <FormMessage tone="error">{error}</FormMessage>
        <FormMessage tone="success">{success}</FormMessage>

        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? dict.sendingLabel : dict.sendLabel}
        </button>
      </form>
    </Modal>
  )
}
