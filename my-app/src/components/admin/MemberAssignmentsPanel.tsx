import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { WING_ORDER, WING_COLORS, GROUP_BAR_COLORS, type WingColor } from '../../lib/wings'
import type { Member, RowStatus } from '../../lib/admin'
import { Panel } from '../ui/Panel'
import { Badge } from '../ui/Badge'

const MEMBER_SELECT =
  'id, uid, username, migration_score, assigned_wing, wing_manual_override, status, ' +
  'f1_power, f2_power, request_id, migration_requests(type, alliance_tag)'

/**
 * Member table with per-row wing assignment and status controls.
 *
 * Rows belonging to the same group request share a colored left bar so a
 * group reads as one block in a list sorted by request.
 */
export function MemberAssignmentsPanel() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [assignStatus, setAssignStatus] = useState<Record<number, RowStatus>>({})
  const [statusStatus, setStatusStatus] = useState<Record<number, RowStatus>>({})
  const [savingRow, setSavingRow] = useState<Record<number, boolean>>({})

  async function load() {
    try {
      const { data, error: queryError } = await supabase
        .from('migration_members')
        .select(MEMBER_SELECT)
        .order('request_id', { ascending: false })
        .order('id', { ascending: true })
        .limit(500)
      if (queryError) throw queryError

      setMembers((data || []) as unknown as Member[])
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // Runs once: the panel owns its own data and refreshes after each write.
     
  }, [])

  /** Runs a row mutation, records its feedback, and refreshes the table. */
  async function runRowAction(
    id: number,
    setFeedback: React.Dispatch<React.SetStateAction<Record<number, RowStatus>>>,
    okText: string,
    action: () => Promise<void>
  ) {
    setSavingRow((s) => ({ ...s, [id]: true }))
    try {
      await action()
      setFeedback((s) => ({ ...s, [id]: { text: okText, ok: true } }))
      load()
    } catch (err) {
      setFeedback((s) => ({
        ...s,
        [id]: { text: err instanceof Error ? err.message : 'Failed', ok: false },
      }))
    } finally {
      setSavingRow((s) => ({ ...s, [id]: false }))
    }
  }

  function assignMember(id: number, newWing: WingColor | '') {
    return runRowAction(id, setAssignStatus, 'Saved', async () => {
      const { error: updateError } = await supabase
        .from('migration_members')
        .update({ assigned_wing: newWing || null, wing_manual_override: true })
        .eq('id', id)
      if (updateError) throw updateError
    })
  }

  function clearOverride(id: number) {
    return runRowAction(id, setAssignStatus, 'Cleared', async () => {
      // Re-writing the score triggers the auto-assignment rule server-side.
      const { data } = await supabase
        .from('migration_members')
        .select('migration_score')
        .eq('id', id)
        .single()

      const { error: updateError } = await supabase
        .from('migration_members')
        .update({ wing_manual_override: false, migration_score: data?.migration_score ?? null })
        .eq('id', id)
      if (updateError) throw updateError
    })
  }

  function setMemberStatus(id: number, newStatus: Member['status']) {
    return runRowAction(id, setStatusStatus, 'Saved', async () => {
      const { error: updateError } = await supabase
        .from('migration_members')
        .update({ status: newStatus })
        .eq('id', id)
      if (updateError) throw updateError
    })
  }

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return members
    return members.filter(
      (m) =>
        (m.username || '').toLowerCase().includes(q) ||
        (m.uid || '').toLowerCase().includes(q)
    )
  }, [search, members])

  const groupColorByRequest = useMemo(() => {
    const map: Record<number, string> = {}
    let idx = 0
    for (const m of filteredMembers) {
      if (m.migration_requests?.type === 'group' && !(m.request_id in map)) {
        map[m.request_id] = GROUP_BAR_COLORS[idx % GROUP_BAR_COLORS.length]
        idx++
      }
    }
    return map
  }, [filteredMembers])

  const legendItems = useMemo(() => {
    const seen = new Set<number>()
    const items: { key: number; color: string; label: string }[] = []
    for (const m of filteredMembers) {
      const req = m.migration_requests
      if (req?.type === 'group' && !seen.has(m.request_id)) {
        seen.add(m.request_id)
        items.push({
          key: m.request_id,
          color: groupColorByRequest[m.request_id],
          label: req.alliance_tag || `Group #${m.request_id}`,
        })
      }
    }
    return items
  }, [filteredMembers, groupColorByRequest])

  // First row of each request group gets the separator line.
  const groupStartIds = useMemo(() => {
    const ids = new Set<number>()
    let last: number | null = null
    for (const m of filteredMembers) {
      if (m.request_id !== last) ids.add(m.id)
      last = m.request_id
    }
    return ids
  }, [filteredMembers])

  return (
    <Panel
      title="Member Assignments"
      subtitle={
        'Auto-assigned wing shown per member. Manually reassigning a member locks their wing so ' +
        "future score changes won't move them automatically — use \"Clear override\" to hand " +
        'control back to auto-assignment. Rows from the same Group Transfer request share a ' +
        'colored left bar and a group tag; Solo Transfer members show no bar.'
      }
    >
      <div className="members-toolbar">
        <input
          type="search"
          placeholder="Search by username or UID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {legendItems.length > 0 && (
        <div className="members-legend">
          {legendItems.map((item) => (
            <span className="members-legend-item" key={item.key}>
              <span className="members-legend-swatch" style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      )}

      {loading && <div className="load-msg">Loading...</div>}
      {error && <div className="load-msg">Failed to load members: {error}</div>}

      {!loading && !error && filteredMembers.length === 0 && (
        <div className="empty-state">No members found.</div>
      )}

      {!loading && !error && filteredMembers.length > 0 && (
        <div className="members-table-wrap">
          <table className="members-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>UID</th>
                <th>F1 Power</th>
                <th>F2 Power</th>
                <th>Score</th>
                <th>Assigned Wing</th>
                <th>Reassign</th>
                <th>Apply</th>
                <th>Status</th>
                <th>Set Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const req = member.migration_requests

                return (
                  <MemberRow
                    key={member.id}
                    member={member}
                    isNewGroup={groupStartIds.has(member.id)}
                    barColor={groupColorByRequest[member.request_id] || 'transparent'}
                    groupTag={
                      req?.type === 'group'
                        ? req.alliance_tag || `Group #${member.request_id}`
                        : null
                    }
                    saving={!!savingRow[member.id]}
                    status={assignStatus[member.id]}
                    statusFeedback={statusStatus[member.id]}
                    onAssign={(wing) => assignMember(member.id, wing)}
                    onClearOverride={() => clearOverride(member.id)}
                    onSetStatus={(next) => setMemberStatus(member.id, next)}
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}

function MemberRow({
  member,
  isNewGroup,
  barColor,
  groupTag,
  saving,
  status,
  statusFeedback,
  onAssign,
  onClearOverride,
  onSetStatus,
}: {
  member: Member
  isNewGroup: boolean
  barColor: string
  groupTag: string | null
  saving: boolean
  status?: RowStatus
  statusFeedback?: RowStatus
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
        {groupTag && <Badge variant="neutral">{groupTag}</Badge>}
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
          <span style={{ color: 'var(--n-500)' }}>Unassigned</span>
        )}
        <Badge variant={member.wing_manual_override ? 'manual' : 'auto'}>
          {member.wing_manual_override ? 'MANUAL' : 'AUTO'}
        </Badge>
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
            style={{ background: 'var(--n-500)' }}
            disabled={saving}
            onClick={onClearOverride}
          >
            Clear override
          </button>
        )}
        {status && <span className={`row-status ${status.ok ? 'ok' : 'err'}`}>{status.text}</span>}
      </td>
      <td>
        <Badge variant={member.status}>{member.status}</Badge>
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
        {statusFeedback && (
          <span className={`row-status ${statusFeedback.ok ? 'ok' : 'err'}`}>{statusFeedback.text}</span>
        )}
      </td>
    </tr>
  )
}
