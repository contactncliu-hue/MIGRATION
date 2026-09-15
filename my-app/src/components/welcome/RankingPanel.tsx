import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth-context'
import type { RankingEntry, CompositionRange, Tier } from '../../types/panels'

const TIER_COLOR: Record<Tier, string> = { gold: '#d4af37', silver: '#a8a8a8', bronze: '#b06a35' }
const TIER_NUM: Record<Tier, string> = { gold: '1', silver: '2', bronze: '3' }

export function RankingPanel() {
  const { isAdmin } = useAuth()
  const [rankings, setRankings] = useState<RankingEntry[]>([])
  const [comps, setComps] = useState<CompositionRange[]>([])
  const [newPower, setNewPower] = useState('')
  const [newTier, setNewTier] = useState<Tier>('gold')
  const [newRange, setNewRange] = useState('')
  const [newCount, setNewCount] = useState('')

  const load = async () => {
    const { data: r } = await supabase.from('server_rankings').select('*').order('power', { ascending: false })
    const { data: c } = await supabase.from('server_composition').select('*').order('sort_order')
    setRankings(r ?? [])
    setComps(c ?? [])
  }
  useEffect(() => { load() }, [])

  const addRanking = async () => {
    const power = parseFloat(newPower)
    if (isNaN(power)) return
    await supabase.from('server_rankings').insert({
      tier: newTier, power, display_label: `${power}G`, sort_order: 0,
    })
    setNewPower('')
    load()
  }
  const removeRanking = async (id: string) => {
    await supabase.from('server_rankings').delete().eq('id', id)
    load()
  }

  const addComp = async () => {
    if (!newRange || !newCount) return
    await supabase.from('server_composition').insert({
      range_label: newRange, player_count: parseFloat(newCount), sort_order: comps.length,
    })
    setNewRange(''); setNewCount('')
    load()
  }
  const removeComp = async (id: string) => {
    await supabase.from('server_composition').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <h3>Rankings</h3>
      {rankings.map((r) => (
        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{
            width: 28, height: 28, borderRadius: '50%', background: TIER_COLOR[r.tier],
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
          }}>{TIER_NUM[r.tier]}</span>
          <span>{r.display_label}</span>
          {isAdmin && <button onClick={() => removeRanking(r.id)}>Remove</button>}
        </div>
      ))}
      {isAdmin && (
        <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
          <select value={newTier} onChange={(e) => setNewTier(e.target.value as Tier)}>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="bronze">Bronze</option>
          </select>
          <input placeholder="Power e.g. 16.9" value={newPower} onChange={(e) => setNewPower(e.target.value)} />
          <button onClick={addRanking}>Add</button>
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
          <button onClick={addComp}>Add</button>
        </div>
      )}
    </div>
  )
}
