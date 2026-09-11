import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { WING_ORDER, WING_COLORS, type WingColor } from '../../lib/wings'
import type { RowStatus, WingConfigRow } from '../../lib/admin'
import { Panel } from '../ui/Panel'

const EMPTY_STATUS: Record<WingColor, RowStatus | null> = {
  RED: null,
  ORANGE: null,
  PURPLE: null,
  BLUE: null,
}

/** Editable thresholds and seat counts, one row per wing. */
export function WingSettingsPanel() {
  const [rows, setRows] = useState<WingConfigRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rowStatus, setRowStatus] = useState<Record<WingColor, RowStatus | null>>(EMPTY_STATUS)
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  async function load() {
    try {
      const { data, error: queryError } = await supabase
        .from('wing_config')
        .select('color, min_score, seat_capacity')
      if (queryError) throw queryError

      const byColor: Record<string, WingConfigRow> = {}
      for (const r of data || []) byColor[r.color] = r as WingConfigRow

      setRows(
        WING_ORDER.map(
          (color) => byColor[color] || { color, min_score: 0, seat_capacity: 100 }
        )
      )
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wing settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // Runs once: the panel owns its own data and refreshes after each write.
     
  }, [])

  async function saveRow(color: WingColor, minScore: number, seatCapacity: number) {
    setSaving((s) => ({ ...s, [color]: true }))
    setRowStatus((s) => ({ ...s, [color]: null }))
    try {
      const { error: updateError } = await supabase
        .from('wing_config')
        .update({ min_score: minScore, seat_capacity: seatCapacity })
        .eq('color', color)
      if (updateError) throw updateError

      setRowStatus((s) => ({ ...s, [color]: { text: 'Saved', ok: true } }))
    } catch (err) {
      setRowStatus((s) => ({
        ...s,
        [color]: { text: err instanceof Error ? err.message : 'Failed', ok: false },
      }))
    } finally {
      setSaving((s) => ({ ...s, [color]: false }))
    }
  }

  return (
    <Panel
      title="Wing Settings"
      subtitle="Set the minimum migration score needed to qualify for each wing, and how many seats it holds. Members are assigned automatically to the highest wing their score qualifies for, unless manually overridden below."
    >
      {loading && <div className="load-msg">Loading...</div>}
      {error && <div className="load-msg">Failed to load wing settings: {error}</div>}

      {!loading && !error && (
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
            {rows.map((row) => (
              <WingConfigRowEditor
                key={row.color}
                row={row}
                saving={!!saving[row.color]}
                status={rowStatus[row.color]}
                onSave={(minScore, seatCapacity) => saveRow(row.color, minScore, seatCapacity)}
              />
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  )
}

function WingConfigRowEditor({
  row, saving, status, onSave,
}: {
  row: WingConfigRow
  saving: boolean
  status: RowStatus | null
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
