import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import './TransferPage.css'

type Faction = 0 | 1 | 2 | 3
const FACTION_LETTERS: Record<Faction, string> = { 0: '', 1: 'F', 2: 'S', 3: 'R' }

interface Member {
  uid: string
  username: string
  prevAlliance: string
  prevServer: string
  killcount: string
  faction: Faction
  role: string
  migrationScore: string
  f1Power: string
  f2Power: string
}

function emptyMember(): Member {
  return { uid: '', username: '', prevAlliance: '', prevServer: '', killcount: '', faction: 0, role: '', migrationScore: '', f1Power: '', f2Power: '' }
}

const WING_ORDER = ['RED', 'ORANGE', 'PURPLE', 'BLUE'] as const
type WingColor = typeof WING_ORDER[number]
const WING_DISPLAY: Record<WingColor, { label: string; color: string }> = {
  RED: { label: 'RED', color: '#c1442e' },
  ORANGE: { label: 'ORANGE', color: '#f2a90f' },
  PURPLE: { label: 'PURPLE', color: '#8b5cf6' },
  BLUE: { label: 'BLUE', color: '#3b82f6' },
}

interface WingRow {
  key: WingColor
  capacity: number
  count: number
}

export function TransferPage() {
  const [stageReady, setStageReady] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [wingRows, setWingRows] = useState<WingRow[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  const [uidModalOpen, setUidModalOpen] = useState(false)
  const [uidInput, setUidInput] = useState('')
  const [uidError, setUidError] = useState('')
  const [uidResult, setUidResult] = useState<{ text: string; cls: string } | null>(null)
  const [uidSearching, setUidSearching] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [transferType, setTransferType] = useState<'solo' | 'group'>('solo')
  const [allianceTag, setAllianceTag] = useState('')
  const [members, setMembers] = useState<Member[]>([emptyMember()])
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const uidInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setStageReady(true), 30)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      setIsAdmin((data?.role || '').toUpperCase() === 'ADMIN')
    }).catch((err) => console.error('user load failed:', err))
  }, [])

  async function loadWingStatus() {
    try {
      const { data: configRows } = await supabase.from('wing_config').select('color, min_score, seat_capacity')
      const { data: memberRows } = await supabase.from('migration_members').select('assigned_wing, status')
      const { data: overrideRows } = await supabase.from('wing_status').select('color, percentage, updated_by')

      const liveCounts: Record<string, number> = {}
      ;(memberRows || []).forEach((m) => {
        if (!m.assigned_wing || m.status !== 'approved') return
        liveCounts[m.assigned_wing] = (liveCounts[m.assigned_wing] || 0) + 1
      })

      const overrides: Record<string, number> = {}
      ;(overrideRows || []).forEach((r) => {
        if (r.percentage != null && r.updated_by != null) overrides[r.color] = r.percentage
      })

      const capacityByColor: Record<string, number> = {}
      ;(configRows || []).forEach((r) => { capacityByColor[r.color] = r.seat_capacity })

      const rows: WingRow[] = WING_ORDER.map((color) => ({
        key: color,
        capacity: capacityByColor[color] ?? 100,
        count: color in overrides ? overrides[color] : (liveCounts[color] || 0),
      }))
      setWingRows(rows)
    } catch (err) {
      console.error('loadWingStatus failed:', err)
    }
  }

  function toggleStatusCard() {
    if (statusOpen) {
      setStatusOpen(false)
    } else {
      setStatusOpen(true)
      loadWingStatus()
    }
  }

  const totalCount = wingRows.reduce((s, r) => s + r.count, 0)
  const totalCapacity = wingRows.reduce((s, r) => s + r.capacity, 0)

  // ---------- UID lookup ----------
  function openUidLookup() {
    setUidModalOpen(true)
    setUidInput('')
    setUidError('')
    setUidResult(null)
    setTimeout(() => uidInputRef.current?.focus(), 0)
  }

  async function runUidLookup() {
    setUidError('')
    setUidResult(null)
    if (!uidInput.trim()) {
      setUidError('Please enter a UID.')
      return
    }
    setUidSearching(true)
    try {
      const { data, error } = await supabase
        .from('migration_members')
        .select('status, created_at')
        .eq('uid', uidInput.trim())
        .order('created_at', { ascending: false })
        .limit(1)
      if (error) throw error
      const row = data?.[0]
      if (!row) {
        setUidError('No migration request found for this UID.')
        return
      }
      const statusKey = (row.status || 'pending').toLowerCase()
      setUidResult({ text: statusKey.toUpperCase(), cls: `status-${statusKey}` })
    } catch (err) {
      setUidError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setUidSearching(false)
    }
  }

  // ---------- Migration modal ----------
  function openModal() {
    setTransferType('solo')
    setAllianceTag('')
    setMembers([emptyMember()])
    setFormError('')
    setFormSuccess('')
    setModalOpen(true)
  }

  function updateMember(idx: number, patch: Partial<Member>) {
    setMembers((prev) => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)))
  }

  function cycleFaction(idx: number) {
    setMembers((prev) => prev.map((m, i) => (i === idx ? { ...m, faction: (((m.faction + 1) % 4) as Faction) } : m)))
  }

  function removeMember(idx: number) {
    setMembers((prev) => prev.filter((_, i) => i !== idx))
  }

  function handleTypeChange(type: 'solo' | 'group') {
    setTransferType(type)
    if (type === 'solo') setMembers((prev) => [prev[0] || emptyMember()])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    const missing = members.some((m) =>
      !m.uid || !m.username || !m.prevAlliance || !m.prevServer || !m.killcount || !m.faction || !m.role || !m.f1Power
    )
    if (transferType === 'group' && !allianceTag.trim()) {
      setFormError('Please fill in every field for every member.')
      return
    }
    if (missing) {
      setFormError('Please fill in every field for every member (Migration Score and F2 Power are the only optional ones).')
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

      setFormSuccess('Migration request sent!')
      setTimeout(() => setModalOpen(false), 1200)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`transfer-stage ${stageReady ? 'stage-ready' : ''} ${statusOpen ? 'status-open' : ''}`}>
      <div className="scene">
        <div className="deco-bg">
          <img src="/assets/transfer-bg-deco.PNG" alt="" />
        </div>
        <div className="arch-card">
          <img className="arch-bg" src="/assets/transfer-arch.PNG" alt="" />
        </div>
        <div className="header-ribbon">
          <img src="/assets/transfer-header.PNG" alt="" />
        </div>
        <div className="bottom-fade" />

        <button className="transfer-btn" onClick={openModal}>
          <img src="/assets/transfer-button.PNG" alt="" />
          <span className="btn-label">MIGRATION</span>
        </button>

        <button className="status-check-btn" onClick={openUidLookup}>
          <img src="/assets/transfer-status-button.PNG" alt="" />
          <span className="status-check-label">CHECK STATUS</span>
        </button>
      </div>

      <div className="status-card" onClick={toggleStatusCard}>
        <img className="status-card-bg" src="/assets/transfer-status-card.PNG" alt="" />
        <button
          className="status-card-close"
          onClick={(e) => { e.stopPropagation(); setStatusOpen(false) }}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="status-rows">
          {wingRows.map((row) => {
            const disp = WING_DISPLAY[row.key]
            const pct = row.capacity > 0 ? Math.max(0, Math.min(100, (row.count / row.capacity) * 100)) : 0
            return (
              <div className="status-row" key={row.key}>
                <div className="status-row-body">
                  <div className="status-row-top">
                    <span className="status-row-name">{disp.label}</span>
                    <span className="status-percent">{row.count}/{row.capacity}</span>
                  </div>
                  <div className="status-bar-track">
                    <div className="status-bar-fill" style={{ width: `${pct}%`, background: disp.color }} />
                  </div>
                </div>
              </div>
            )
          })}
          {isAdmin && wingRows.length > 0 && (
            <div className="status-total" style={{ color: totalCount >= totalCapacity ? '#a3f0b0' : '#ffd9a0' }}>
              Total: {totalCount}/{totalCapacity}
            </div>
          )}
        </div>
      </div>

      {/* ---------- Migration modal ---------- */}
      {modalOpen && (
        <div className="modal-overlay visible" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="modal-box">
            <button className="modal-close" onClick={() => setModalOpen(false)} aria-label="Close">&times;</button>
            <h2>Migration</h2>
            <p className="modal-sub">Send items or funds to another member.</p>

            <div className="transfer-type-toggle">
              <button type="button" className={`type-btn ${transferType === 'solo' ? 'active' : ''}`} onClick={() => handleTypeChange('solo')}>
                Solo Transfer
              </button>
              <button type="button" className={`type-btn ${transferType === 'group' ? 'active' : ''}`} onClick={() => handleTypeChange('group')}>
                Group Transfer
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {transferType === 'group' && (
                <div className="field">
                  <label>Group Name</label>
                  <input type="text" placeholder="e.g. ONE" value={allianceTag} onChange={(e) => setAllianceTag(e.target.value)} />
                </div>
              )}

              {members.map((m, idx) => (
                <div className="member-row" key={idx}>
                  {transferType === 'group' && (
                    <div className="member-row-header">
                      <span>MEMBER #{idx + 1}</span>
                      {members.length > 1 && (
                        <button type="button" className="remove-member-btn" onClick={() => removeMember(idx)}>Remove</button>
                      )}
                    </div>
                  )}

                  <div className="field">
                    <label>UID</label>
                    <input
                      type="text" inputMode="numeric" maxLength={21}
                      value={m.uid}
                      onChange={(e) => updateMember(idx, { uid: e.target.value.replace(/[^0-9]/g, '').slice(0, 21) })}
                    />
                  </div>
                  <div className="field">
                    <label>Username</label>
                    <input type="text" value={m.username} onChange={(e) => updateMember(idx, { username: e.target.value })} />
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label>Previous Alliance</label>
                      <input type="text" value={m.prevAlliance} onChange={(e) => updateMember(idx, { prevAlliance: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>Previous Server</label>
                      <input type="text" placeholder="e.g. S1" value={m.prevServer} onChange={(e) => updateMember(idx, { prevServer: e.target.value })} />
                    </div>
                  </div>
                  <div className="field">
                    <label>Kill Count</label>
                    <input
                      type="text" inputMode="numeric" placeholder="e.g. 13"
                      value={m.killcount ? `${m.killcount}M` : ''}
                      onChange={(e) => updateMember(idx, { killcount: e.target.value.replace(/[^0-9]/g, '') })}
                    />
                  </div>
                  <div className="field-row faction-role-row">
                    <div className="faction-picker">
                      <label>Faction</label>
                      <button type="button" className="faction-btn" data-state={m.faction} onClick={() => cycleFaction(idx)}>
                        <span className="faction-letter">{FACTION_LETTERS[m.faction]}</span>
                      </button>
                    </div>
                    <div className="field">
                      <label>Role</label>
                      <select value={m.role} onChange={(e) => updateMember(idx, { role: e.target.value })}>
                        <option value="">--</option>
                        {Array.from({ length: 10 }, (_, i) => `i${i + 1}`).map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="field">
                    <label>Migration Score (optional)</label>
                    <input type="text" inputMode="numeric" value={m.migrationScore} onChange={(e) => updateMember(idx, { migrationScore: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>F1 Power</label>
                    <input type="text" inputMode="numeric" required value={m.f1Power} onChange={(e) => updateMember(idx, { f1Power: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>F2 Power (optional)</label>
                    <input type="text" inputMode="numeric" value={m.f2Power} onChange={(e) => updateMember(idx, { f2Power: e.target.value })} />
                  </div>
                </div>
              ))}

              {transferType === 'group' && (
                <button type="button" className="add-member-btn" onClick={() => setMembers((prev) => [...prev, emptyMember()])}>
                  + Add Member
                </button>
              )}

              {formError && <div className="form-error visible">{formError}</div>}
              {formSuccess && <div className="form-success visible">{formSuccess}</div>}

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'SENDING...' : 'SEND'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------- UID lookup modal ---------- */}
      {uidModalOpen && (
        <div className="modal-overlay visible" onClick={(e) => { if (e.target === e.currentTarget) setUidModalOpen(false) }}>
          <div className="modal-box">
            <button className="modal-close" onClick={() => setUidModalOpen(false)} aria-label="Close">&times;</button>
            <h2>Check Status</h2>
            <p className="modal-sub">Enter your UID to see your migration status.</p>

            <div className="field">
              <label>UID</label>
              <input
                ref={uidInputRef}
                type="text" inputMode="numeric" maxLength={21}
                placeholder="e.g. 1234567890123"
                value={uidInput}
                onChange={(e) => setUidInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 21))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); runUidLookup() } }}
              />
            </div>

            <button type="button" className="submit-btn" disabled={uidSearching} onClick={runUidLookup}>
              {uidSearching ? 'SEARCHING...' : 'SEARCH'}
            </button>

            {uidError && <div className="form-error visible">{uidError}</div>}
            {uidResult && <div className={`uid-lookup-result visible ${uidResult.cls}`}>{uidResult.text}</div>}
          </div>
        </div>
      )}
    </div>
  )
}
