export type Tier = 'gold' | 'silver' | 'bronze'

export interface RankingEntry {
  id: string
  power: number
  display_label: string
  sort_order: number
  // tier is intentionally NOT stored — it's derived by sorting on `power`
  // (top 3 = gold/silver/bronze) in RankingPanel, so it can never go stale.
}

export interface CompositionRange {
  id: string
  range_label: string
  player_count: number
  sort_order: number
}

export interface ServerInfoField {
  id: string
  field: 'languages' | 'territory' | 'diplomacy'
  content: string
}

export interface RequirementRow {
  id: string
  row_number: number
  content: string
  sort_order: number
}

export interface AdditionalInfoItem {
  id: string
  section: 'contact' | 'migration_exception'
  label: string
  is_emphasized: boolean
  sort_order: number
}
