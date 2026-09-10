import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import './AdminPage.css'

type WingColor = 'RED' | 'ORANGE' | 'PURPLE' | 'BLUE'
const WING_ORDER: WingColor[] = ['RED', 'ORANGE', 'PURPLE', 'BLUE']
const WING_COLORS: Record<WingColor, string> = {
  RED: '#c1442e',
  ORANGE: '#f2a90f',
  PURPLE: '#8b5cf6',
  BLUE: '#3b82f6',
}
const GROUP_BAR_COLORS = ['#3B5BDB', '#f2a90f', '#2b8a3e', '#8b5cf6', '#e03131', '#0ca678', '#c2255c', '#1971c2']

interface WingConfigRow {
  color: WingColor
  min_score: number
  seat_capacity: number
}

interface MigrationRequest {
  type: 'solo' | 'group'
  alliance_tag: string | null
}

interface Member {
  id: number
  uid: string
  username: string
  migration_score: number | null
  assigned_wing: WingColor | null
  wing_manual_override: boolean
  status: 'pending' | 'approved' | 'rejected'
  f1_power: number | null
  f2_power: number | null
  request_id: number
  migration_requests: MigrationRequest | null
}

export function AdminPage() {
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const [wingConfig, setWingConfig] = useState<WingConfigRow[]>([])
  const [wingLoading, setWingLoading] = useState(true)
  const [wingError, setWingError] = useState('')
  const [wingRowStatus, setWingRowStatus] = useState<Record<WingColor, { text: string; ok: boolean } | null>>({
    RED: null, ORANGE: null, PURPLE: null, BLUE: null,
  })
  const [wingSaving, setWingSaving] = useState<Record<string, boolean>>({})

  const [members, setMembers] = useState<Member[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [membersError, setMembersError] = useState('')
  const [search, setSearch] = useState('')
  const [rowStatus, setRowStatus] = useState<Record<number, { text: string; ok: boolean }>>({})
  const [rowStatusStatus, setRowStatusStatus] = useState<Record<number, { text: string; ok: boolean }>>({})
  const [savingRow, setSavingRow] = useState<Record<number, boolean>>({})

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setCheckingAuth(false); return }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const role = (profile?.role || 'guest').toUpperCase()
        setIsAdmin(role === 'ADMIN')
      } catch (err) {
        console.error('admin check failed:', err)
      } finally {
        setCheckingAuth(false)
      }
    }
    checkAdmin()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadWingConfig()
      loadMembers()
    }
  }, [isAdmin])

  async function loadWingConfig() {
    setWingLoading(true)
    setWingError('')
    try {
      const { data, error } = await supabase.from('wing_config').select('color, min_score, seat_capacity')
      if (error) throw error
      const byColor: Record<string, WingConfigRow> = {}
      ;(data || []).forEach((r) => { byColor[r.color] = r as WingConfigRow })
      const rows = WING_ORDER.map((color) => byColor[color] || { color, min_score: 0, seat_capacity: 100 })
      setWingConfig(rows)
    } catch (err) {
      setWingError(err instanceof Error ? err.message : 'Failed to load wing settings')
    } finally {
      setWingLoading(false)
    }
  }

  async function saveWingRow(color: WingColor, minScore: number, seatCapacity: number) {
    setWingSaving((s) => ({ ...s, [color]: true }))
    setWingRowStatus((s) => ({ ...s, [color]: null }))
    try {
      const { error } = await supabase.from('wing_config')
        .update({ min_score: minScore, seat_capacity: seatCapacity })
        .eq('color', color)
      if (error) throw error
      setWingRowStatus((s) => ({ ...s, [color]: { text: 'Saved', ok: true } }))
    } catch (err) {
      setWingRowStatus((s) => ({ ...s, [color]: { text: err instanceof Error ? err.message : 'Failed', ok: false } }))
    } finally {
      setWingSaving((s) => ({ ...s, [color]: false }))
    }
  }

  async function loadMembers() {
    setMembersLoading(true)
    setMembersError('')
    try {
      const { data, error } = await supabase
        .from('migration_members')
        .select('id, uid, username, migration_score, assigned_wing, wing_manual_override, status, f1_power, f2_power, request_id, migration_requests(type, alliance_tag)')
        .order('request_id', { ascending: false })
        .order('id', { ascending: true })
        .limit(500)
      if (error) throw error
      setMembers((data || []) as unknown as Member[])
    } catch (err) {
      setMembersError(err instanceof Error ? err.message : 'Failed to load members')
    } finally {
      setMembersLoading(false)
    }
  }

  async function assignMember(id: number, newWing: WingColor | '') {
    setSavingRow((s) => ({ ...s, [id]: true }))
    try {
      const { error } = await supabase.from('migration_members')
        .update({ assigned_wing: newWing || null, wing_manual_override: true })
        .eq('id', id)
      if (error) throw error
      setRowStatus((s) => ({ ...s, [id]: { text: 'Saved', ok: true } }))
      loadMembers()
    } catch (err) {
      setRowStatus((s) => ({ ...s, [id]: { text: err instanceof Error ? err.message : 'Failed', ok: false } }))
    } finally {
      setSavingRow((s) => ({ ...s, [id]: false }))
    }
  }

  async function clearOverride(id: number) {
    setSavingRow((s) => ({ ...s, [id]: true }))
    try {
      const { data: memberData } = await supabase.from('migration_members').select('migration_score').eq('id', id).single()
      const currentScore = memberData?.migration_score ?? null
      const { error } = await supabase.from('migration_members')
        .update({ wing_manual_override: false, migration_score: currentScore })
        .eq('id', id)
      if (error) throw error
      setRowStatus((s) => ({ ...s, [id]: { text: 'Cleared', ok: true } }))
      loadMembers()
    } catch (err) {
      setRowStatus((s) => ({ ...s, [id]: { text: err instanceof Error ? err.message : 'Failed', ok: false } }))
    } finally {
      setSavingRow((s) => ({ ...s, [id]: false }))
    }
  }

  async function setMemberStatus(id: number, newStatus: Member['status']) {
    setSavingRow((s) => ({ ...s, [id]: true }))
    try {
      const { error } = await supabase.from('migration_members').update({ status: newStatus }).eq('id', id)
      if (error) throw error
      setRowStatusStatus((s) => ({ ...s, [id]: { text: 'Saved', ok: true } }))
      loadMembers()
    } catch (err) {
      setRowStatusStatus((s) => ({ ...s, [id]: { text: err instanceof Error ? err.message : 'Failed', ok: false } }))
    } finally {
      setSavingRow((s) => ({ ...s, [id]: false }))
    }
  }

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return members
    return members.filter((m) =>
      (m.username || '').toLowerCase().includes(q) || (m.uid || '').toLowerCase().includes(q)
    )
  }, [search, members])

  const groupColorByRequest = useMemo(() => {
    const map: Record<number, string> = {}
    let idx = 0
    filteredMembers.forEach((m) => {
      const isGroup = m.migration_requests?.type === 'group'
      if (isGroup && !(m.request_id in map)) {
        map[m.request_id] = GROUP_BAR_COLORS[idx % GROUP_BAR_COLORS.length]
        idx++
      }
    })
    return map
  }, [filteredMembers])

  const legendItems = useMemo(() => {
    const seen = new Set<number>()
    const items: { key: number; color: string; label: string }[] = []
    filteredMembers.forEach((m) => {
      const req = m.migration_requests
      if (req?.type === 'group' && !seen.has(m.request_id)) {
        seen.add(m.request_id)
        items.push({
          key: m.request_id,
          color: groupColorByRequest[m.request_id],
          label: req.alliance_tag || `Group #${m.request_id}`,
        })
      }
    })
    return items
  }, [filteredMembers, groupColorByRequest])

  if (checkingAuth) return null

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="page-title">Admin &amp; Management</div>
        <div className="page-sub">Wing thresholds, seat capacity, and manual member assignments.</div>
        <div className="gate-message visible">
          This page is admin-only. You're not signed in with an admin account, so there's nothing to manage here.
        </div>
      </div>
    )
  }

  let lastRequestId: number | null = null

  return (
    <div className="admin-page">
      <div className="page-title">Admin &amp; Management</div>
      <div className="page-sub">Wing thresholds, seat capacity, and manual member assignments.</div>

      <div className="admin-content visible">
        {/* WING SETTINGS */}
        <div className="panel">
          <h2>Wing Settings</h2>
          <div className="panel-sub">
            Set the minimum migration score needed to qualify for each wing, and how many seats it holds.
            Members are assigned automatically to the highest wing their score qualifies for, unless manually overridden below.
          </div>
          {wingLoading && <div className="load-msg">Loading...</div>}
          {wingError && <div className="load-msg">Failed to load wing settings: {wingError}</div>}
          {!wingLoading && !wingError && (
            <table className="wing-table">
              <thead>
                <tr>
                  <th>Wing</th>
                  <th>Min. Score</th>
                  <th>Seat Capacity</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {wingConfig.map((row) => (
                  <WingConfigRowEditor
                    key={row.color}
                    row={row}
                    saving={!!wingSaving[row.color]}
                    status={wingRowStatus[row.color]}
                    onSave={(minScore, seatCapacity) => saveWingRow(row.color, minScore, seatCapacity)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* MEMBER ASSIGNMENTS */}
        <div className="panel">
          <h2>Member Assignments</h2>
          <div className="panel-sub">
            Auto-assigned wing shown per member. Manually reassigning a member locks their wing so future score
            changes won't move them automatically — use "Clear override" to hand control back to auto-assignment.
            Rows from the same Group Transfer request share a colored left bar and a group tag; Solo Transfer
            members show no bar.
          </div>
          <div className="members-toolbar">
            <input
              type="text"
              placeholder="Search by username or UID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="members-legend">
            {legendItems.map((item) => (
              <span className="members-legend-item" key={item.key}>
                <span className="members-legend-swatch" style={{ background: item.color }} />
                {item.label}
              </span>
            ))}
          </div>

          {membersLoading && <div className="load-msg">Loading...</div>}
          {membersError && <div className="load-msg">Failed to load members: {membersError}</div>}

          {!membersLoading && !membersError && (
            filteredMembers.length === 0 ? (
              <div className="empty-state">No members found.</div>
            ) : (
              <div className="members-table-wrap">
                <table className="members-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>UID</th>
                      <th>F1 Power</th>
                      <th>F2 Power</th>
                      <th>Migration Score</th>
                      <th>Assigned Wing</th>
                      <th>Change To</th>
                      <th></th>
                      <th>Status</th>
                      <th>Set Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((m) => {
                      const isNewGroup = lastRequestId !== null && lastRequestId !== m.request_id
                      lastRequestId = m.request_id
                      const barColor = groupColorByRequest[m.request_id] || 'transparent'
                      const isGroup = m.migration_requests?.type === 'group'
                      const groupTag = isGroup
                        ? (m.migration_requests?.alliance_tag || `Group #${m.request_id}`)
                        : null

                      return (
                        <MemberRow
                          key={m.id}
                          member={m}
                          isNewGroup={isNewGroup}
                          barColor={barColor}
                          groupTag={groupTag}
                          saving={!!savingRow[m.id]}
                          status={rowStatus[m.id]}
                          statusStatus={rowStatusStatus[m.id]}
                          onAssign={(wing) => assignMember(m.id, wing)}
                          onClearOverride={() => clearOverride(m.id)}
                          onSetStatus={(s) => setMemberStatus(m.id, s)}
                        />
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

// ---------- Row sub-components ----------

function WingConfigRowEditor({
  row, saving, status, onSave,
}: {
  row: WingConfigRow
  saving: boolean
  status: { text: string; ok: boolean } | null
  onSave: (minScore: number, seatCapacity: number) => void
}) {
  const [minScore, setMinScore] = useState(row.min_score)
  const [seatCapacity, setSeatCapacity] = useState(row.seat_capacity)

  return (
    <tr>
      <td>
        <span className="wing-swatch">
          <span className="wing-dot" style={{ background: WING_COLORS[row.color] }} />
          {row.color}
        </span>
      </td>
      <td>
        <input
          type="number"
          min={0}
          step={1}
          value={minScore}
          onChange={(e) => setMinScore(parseInt(e.target.value, 10) || 0)}
        />
      </td>
      <td>
        <input
          type="number"
          min={0}
          step={1}
          value={seatCapacity}
          onChange={(e) => setSeatCapacity(parseInt(e.target.value, 10) || 0)}
        />
      </td>
      <td>
        <button type="button" className="row-save-btn" disabled={saving} onClick={() => onSave(minScore, seatCapacity)}>
          Save
        </button>
        {status && <span className={`row-status ${status.ok ? 'ok' : 'err'}`}>{status.text}</span>}
      </td>
    </tr>
  )
}

function MemberRow({
  member, isNewGroup, barColor, groupTag, saving, status, statusStatus, onAssign, onClearOverride, onSetStatus,
}: {
  member: Member
  isNewGroup: boolean
  barColor: string
  groupTag: string | null
  saving: boolean
  status?: { text: string; ok: boolean }
  statusStatus?: { text: string; ok: boolean }
  onAssign: (wing: WingColor | '') => void
  onClearOverride: () => void
  onSetStatus: (status: Member['status']) => void
}) {
  const [selectedWing, setSelectedWing] = useState<WingColor | ''>(member.assigned_wing || '')
  const [selectedStatus, setSelectedStatus] = useState<Member['status']>(member.status || 'pending')

  return (
    <tr className={isNewGroup ? 'new-group' : ''}>
      <td className="group-bar-cell" style={{ borderLeftColor: barColor }}>
        {member.username}
        {groupTag && <span className="group-tag-badge">{groupTag}</span>}
      </td>
      <td>{member.uid}</td>
      <td>{member.f1_power ?? '—'}</td>
      <td>{member.f2_power ?? '—'}</td>
      <td>{member.migration_score ?? '—'}</td>
      <td>
        {member.assigned_wing ? (
          <span className="wing-swatch">
            <span className="wing-dot" style={{ background: WING_COLORS[member.assigned_wing] }} />
            {member.assigned_wing}
          </span>
        ) : (
          <span style={{ color: '#aaa' }}>Unassigned</span>
        )}
        <span className={`override-badge ${member.wing_manual_override ? 'manual' : 'auto'}`}>
          {member.wing_manual_override ? 'MANUAL' : 'AUTO'}
        </span>
      </td>
      <td>
        <select className="wing-select" value={selectedWing} onChange={(e) => setSelectedWing(e.target.value as WingColor | '')}>
          <option value="">-- Unassigned --</option>
          {WING_ORDER.map((color) => (
            <option key={color} value={color}>{color}</option>
          ))}
        </select>
      </td>
      <td>
        <button type="button" className="row-save-btn" disabled={saving} onClick={() => onAssign(selectedWing)}>
          Set
        </button>
        {member.wing_manual_override && (
          <button
            type="button"
            className="row-save-btn"
            style={{ background: '#999' }}
            disabled={saving}
            onClick={onClearOverride}
          >
            Clear override
          </button>
        )}
        {status && <span className={`row-status ${status.ok ? 'ok' : 'err'}`}>{status.text}</span>}
      </td>
      <td>
        <span className={`status-badge ${member.status}`}>{member.status}</span>
      </td>
      <td>
        <select className="status-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as Member['status'])}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button type="button" className="row-save-btn" disabled={saving} onClick={() => onSetStatus(selectedStatus)}>
          Set
        </button>
        {statusStatus && <span className={`row-status ${statusStatus.ok ? 'ok' : 'err'}`}>{statusStatus.text}</span>}
      </td>
    </tr>
  )
}
