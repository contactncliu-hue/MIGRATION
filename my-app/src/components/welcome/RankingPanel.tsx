import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import type { RankingEntry, CompositionRange, Tier } from '../../types/panels'

const TIER_COLOR: Record<Tier, string> = { gold: '#d4af37', silver: '#a8a8a8', bronze: '#b06a35' }
const TIER_NUM: Record<Tier, string> = { gold: '1', silver: '2', bronze: '3' }
// Position 0/1/2 in the power-sorted list -> gold/silver/bronze. No manual tier picking anymore.
const TIER_BY_RANK: Tier[] = ['gold', 'silver', 'bronze']

export function RankingPanel() {
  const { isAdmin } = useAuth()
  const [rankings, setRankings] = useState<RankingEntry[]>([])
  const [comps, setComps] = useState<CompositionRange[]>([])
  const [newPower, setNewPower] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newRange, setNewRange] = useState('')
  const [newCount, setNewCount] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data: r, error: rErr } = await supabase
      .from('server_rankings')
      .select('*')
      .order('power', { ascending: false })
    if (rErr) console.error('Failed to load rankings:', rErr.message)

    const { data: c, error: cErr } = await supabase.from('server_composition').select('*').order('sort_order')
    if (cErr) console.error('Failed to load composition:', cErr.message)

    setRankings(r ?? [])
    setComps(c ?? [])
  }
  useEffect(() => { load() }, [])

  // Always compute rank fresh from power, descending. Top 3 = gold/silver/bronze automatically.
  const sorted = [...rankings].sort((a, b) => b.power - a.power)

  const addRanking = async () => {
    const power = parseFloat(newPower)
    if (isNaN(power)) return
    setSaving(true)
    const { error } = await supabase.from('server_rankings').insert({
      power,
      display_label: newLabel.trim() || `${power}G`,
      sort_order: 0,
    })
    setSaving(false)

    if (error) {
      console.error('Failed to add ranking:', error.message)
      alert(`Could not save ranking: ${error.message}`)
      return
    }
    setNewPower('')
    setNewLabel('')
    load()
  }

  const removeRanking = async (id: string) => {
    const { error } = await supabase.from('server_rankings').delete().eq('id', id)
    if (error) {
      alert(`Could not remove: ${error.message}`)
      return
    }
    load()
  }

  const addComp = async () => {
    if (!newRange || !newCount) return
    setSaving(true)
    const { error } = await supabase.from('server_composition').insert({
      range_label: newRange,
      player_count: parseFloat(newCount),
      sort_order: comps.length,
    })
    setSaving(false)

    if (error) {
      console.error('Failed to add composition:', error.message)
      alert(`Could not save: ${error.message}`)
      return
    }
    setNewRange('')
    setNewCount('')
    load()
  }

  const removeComp = async (id: string) => {
    const { error } = await supabase.from('server_composition').delete().eq('id', id)
    if (error) {
      alert(`Could not remove: ${error.message}`)
      return
    }
    load()
  }

  return (
    <div>
      <h3>Rankings</h3>
      {sorted.map((r, i) => {
        const tier = TIER_BY_RANK[i] // undefined past 3rd place
        return (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            {tier ? (
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: TIER_COLOR[tier],
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                {TIER_NUM[tier]}
              </span>
            ) : (
              <span style={{ width: 28, textAlign: 'center', color: '#888' }}>{i + 1}</span>
            )}
            <span>{r.display_label}</span>
            {isAdmin && <button onClick={() => removeRanking(r.id)}>Remove</button>}
          </div>
        )
      })}
      {isAdmin && (
        <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
          <input placeholder="Power e.g. 16.9" value={newPower} onChange={(e) => setNewPower(e.target.value)} />
          <input placeholder="Label (optional)" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
          <button onClick={addRanking} disabled={saving}>Add</button>
        </div>
      )}

      <h3 style={{ marginTop: 20 }}>Server Composition</h3>
      {comps.map((c) => (
        <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
          <span>{c.range_label} = {c.player_count} players</span>
          {isAdmin && <button onClick={() => removeComp(c.id)}>Remove</button>}
        </div>
      ))}
      {isAdmin && (
        <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
          <input placeholder="Range e.g. 5-9G" value={newRange} onChange={(e) => setNewRange(e.target.value)} />
          <input placeholder="Total players" value={newCount} onChange={(e) => setNewCount(e.target.value)} />
          <button onClick={addComp} disabled={saving}>Add</button>
        </div>
      )}
    </div>
  )
}
