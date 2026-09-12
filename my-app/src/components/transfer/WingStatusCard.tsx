import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { WING_ORDER, WING_DISPLAY, type WingColor } from '../../lib/wings'
import { useAuth } from '../../lib/auth-context'

export interface WingRow {
  key: WingColor
  capacity: number
  count: number
}

// TODO: the Blue link supplied was identical to Purple's (same filename,
// same token) — almost certainly a copy/paste slip. Swap in the real Blue
// asset URL here once you have it; everything else about the row will
// keep working unchanged.
const WING_ICONS: Record<WingColor, string> = {
  red: 'https://nlqzanjivjfkftvazrvi.supabase.co/storage/v1/object/sign/assets/IMG_7770.png?token=eyJraWQiOiI5NmIyZWE5MC0yYjdiLTQ5MTktYmY3NC1kMGE4YTQzYjU1ZTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJhc3NldHMvSU1HXzc3NzAucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4ODc3Mzg2OCwiZXhwIjoxODIwMzA5ODY4fQ.jgYM18S1iupAzLHn1UCdOcVjHO1lxZiI6iAtRonVyLdp4-OODXY9Rov7ARaeH_g-CE-wXgaDMNPU0sgOwmOTVA',
  orange: 'https://nlqzanjivjfkftvazrvi.supabase.co/storage/v1/object/sign/assets/IMG_7771.png?token=eyJraWQiOiI5NmIyZWE5MC0yYjdiLTQ5MTktYmY3NC1kMGE4YTQzYjU1ZTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJhc3NldHMvSU1HXzc3NzEucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4ODc3Mzg4OSwiZXhwIjoxODIwMzA5ODg5fQ.emdybSoepVaHA0AEFKPX4QmfQzEuWzJTjKvqIMIFEgBuZlHMqZIR9FZ5nFYvLeUBPV_qtiUcIogyNkG4xvVkZw',
  purple: 'https://nlqzanjivjfkftvazrvi.supabase.co/storage/v1/object/sign/assets/IMG_7772.png?token=eyJraWQiOiI5NmIyZWE5MC0yYjdiLTQ5MTktYmY3NC1kMGE4YTQzYjU1ZTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJhc3NldHMvSU1HXzc3NzIucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4ODc3MzkxMCwiZXhwIjoxODIwMzA5OTEwfQ.OaTGQLieD6dNqdyWw08E6Qt9iN1jX9FVOjCGP3uK4SVpLRmqGj5QealsdDuWQs7z_THagYgriNgtCyZLVPkgFQ',
  blue: 'https://nlqzanjivjfkftvazrvi.supabase.co/storage/v1/object/sign/assets/IMG_7772.png?token=eyJraWQiOiI5NmIyZWE5MC0yYjdiLTQ5MTktYmY3NC1kMGE4YTQzYjU1ZTAiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJhc3NldHMvSU1HXzc3NzIucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4ODc3MzkxMCwiZXhwIjoxODIwMzA5OTEwfQ.OaTGQLieD6dNqdyWw08E6Qt9iN1jX9FVOjCGP3uK4SVpLRmqGj5QealsdDuWQs7z_THagYgriNgtCyZLVPkgFQ',
}

/**
 * Slide-out card showing how full each wing is.
 *
 * A row's count is the number of approved members, unless an admin has pinned
 * a percentage in `wing_status` — a manual override wins over the live count.
 */
export function WingStatusCard({ open, onToggle, onClose }: {
  open: boolean
  onToggle: () => void
  onClose: () => void
}) {
  const { isAdmin } = useAuth()
  const [rows, setRows] = useState<WingRow[]>([])

  async function load() {
    try {
      const [{ data: configRows }, { data: memberRows }, { data: overrideRows }] = await Promise.all([
        supabase.from('wing_config').select('color, min_score, seat_capacity'),
        supabase.from('migration_members').select('assigned_wing, status'),
        supabase.from('wing_status').select('color, percentage, updated_by'),
      ])

      const liveCounts: Record<string, number> = {}
      for (const m of memberRows || []) {
        if (!m.assigned_wing || m.status !== 'approved') continue
        liveCounts[m.assigned_wing] = (liveCounts[m.assigned_wing] || 0) + 1
      }

      const overrides: Record<string, number> = {}
      for (const r of overrideRows || []) {
        if (r.percentage != null && r.updated_by != null) overrides[r.color] = r.percentage
      }

      const capacityByColor: Record<string, number> = {}
      for (const r of configRows || []) capacityByColor[r.color] = r.seat_capacity

      setRows(
        WING_ORDER.map((color) => ({
          key: color,
          capacity: capacityByColor[color] ?? 100,
          count: color in overrides ? overrides[color] : liveCounts[color] || 0,
        }))
      )
    } catch (err) {
      console.error('loadWingStatus failed:', err)
    }
  }

  function handleToggle() {
    if (!open) load()
    onToggle()
  }

  const totalCount = rows.reduce((s, r) => s + r.count, 0)
  const totalCapacity = rows.reduce((s, r) => s + r.capacity, 0)

  return (
    <div className="status-card" onClick={handleToggle}>
      <img className="status-card-bg" src="/assets/transfer-status-card.PNG" alt="" />
      <button
        className="status-card-close"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        aria-label="Close"
      >
        &times;
      </button>

      <div className="status-rows">
        {rows.map((row) => {
          const disp = WING_DISPLAY[row.key]
          const pct =
            row.capacity > 0 ? Math.max(0, Math.min(100, (row.count / row.capacity) * 100)) : 0

          return (
            <div className="status-row" key={row.key}>
              <img className="status-row-icon" src={WING_ICONS[row.key]} alt="" />
              <div className="status-row-body">
                <div className="status-row-top">
                  <span className="status-row-name">{disp.label}</span>
                  <span className="status-percent">
                    {row.count}/{row.capacity}
                  </span>
                </div>
                <div className="status-bar-track">
                  <div
                    className="status-bar-fill"
                    style={{ width: `${pct}%`, background: disp.color }}
                  />
                </div>
              </div>
            </div>
          )
        })}

        {rows.length > 0 && (
          <div className="status-total" style={{ color: '#F2A93B' }}>
            Total: {totalCount}/{totalCapacity}
          </div>
        )}
      </div>
    </div>
  )
}
