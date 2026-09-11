import type { WingColor } from './wings'

export interface WingConfigRow {
  color: WingColor
  min_score: number
  seat_capacity: number
}

export interface MigrationRequest {
  type: 'solo' | 'group'
  alliance_tag: string | null
}

export type MemberStatus = 'pending' | 'approved' | 'rejected'

export interface Member {
  id: number
  uid: string
  username: string
  migration_score: number | null
  assigned_wing: WingColor | null
  wing_manual_override: boolean
  status: MemberStatus
  f1_power: number | null
  f2_power: number | null
  request_id: number
  migration_requests: MigrationRequest | null
}

/** Per-row save feedback shown next to the action buttons. */
export interface RowStatus {
  text: string
  ok: boolean
}
