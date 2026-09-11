/** Shape of one member row inside a migration request form. */
export type Faction = 0 | 1 | 2 | 3

export const FACTION_LETTERS: Record<Faction, string> = { 0: '', 1: 'F', 2: 'S', 3: 'R' }

export interface MemberDraft {
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

export function emptyMember(): MemberDraft {
  return {
    uid: '',
    username: '',
    prevAlliance: '',
    prevServer: '',
    killcount: '',
    faction: 0,
    role: '',
    migrationScore: '',
    f1Power: '',
    f2Power: '',
  }
}

export type TransferType = 'solo' | 'group'
