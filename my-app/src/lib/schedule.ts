/**
 * Server event schedule.
 *
 * These times used to be baked into icons-{red,purple,green}.PNG — the screen
 * said "time can be subject to change" while changing one required Photoshop.
 * Editing this file is the whole update path now.
 *
 * Times are server time, as shown in-game. Deliberately not a countdown:
 * the timezone the game reports has never been written down anywhere, and a
 * wrong countdown makes people miss events.
 */
export type EventKey = 'resource' | 'monster' | 'boss'

export interface ScheduleEvent {
  key: EventKey
  label: string
  times: string[]
}

export interface ScheduleDay {
  /** 0 = today, 1 = tomorrow, 2 = the day after. */
  offset: 0 | 1 | 2
  /** Portal artwork this day is painted with. */
  color: 'red' | 'purple' | 'green'
  events: ScheduleEvent[]
}

export const EVENT_ICONS: Record<EventKey, string> = {
  resource: '/assets/event-resource.png',
  monster: '/assets/event-monster.png',
  boss: '/assets/event-boss.png',
}

/** Same line-up every day for now — only the times would differ. */
const DAILY: ScheduleEvent[] = [
  { key: 'resource', label: 'Resource', times: ['01:00', '10:00'] },
  { key: 'monster', label: 'Monster', times: ['10:30'] },
  { key: 'boss', label: 'Boss', times: ['10:30', '22:30'] },
]

export const SCHEDULE: ScheduleDay[] = [
  { offset: 1, color: 'purple', events: DAILY },
  { offset: 0, color: 'red', events: DAILY },
  { offset: 2, color: 'green', events: DAILY },
]

/** Index of today's card — the carousel opens here. */
export const TODAY_INDEX = SCHEDULE.findIndex((d) => d.offset === 0)

const DAY_LABELS: Record<number, string> = {
  0: 'Today',
  1: 'Tomorrow',
  2: 'Day 3',
}

export function dayLabel(offset: number): string {
  return DAY_LABELS[offset] ?? `Day ${offset + 1}`
}

/**
 * "Sep 11" style date for a day offset.
 *
 * Pinned to en-US rather than the viewer's locale: the rest of this screen is
 * English, and a lone Korean date next to "Today" reads as a bug.
 */
export function dayDate(offset: number, now: Date): string {
  const d = new Date(now)
  d.setDate(d.getDate() + offset)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
