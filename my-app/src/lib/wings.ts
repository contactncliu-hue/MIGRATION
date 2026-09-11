/**
 * Wing definitions — the one place a wing's identity lives.
 *
 * Colors resolve to the design tokens in styles/tokens.css, so changing a
 * wing's color is a single edit there and the CSS swatches, the inline
 * React styles and the admin legend all follow.
 */
export const WING_ORDER = ['RED', 'ORANGE', 'PURPLE', 'BLUE'] as const

export type WingColor = (typeof WING_ORDER)[number]

export const WING_COLORS: Record<WingColor, string> = {
  RED: 'var(--wing-red)',
  ORANGE: 'var(--wing-orange)',
  PURPLE: 'var(--wing-purple)',
  BLUE: 'var(--wing-blue)',
}

export const WING_DISPLAY: Record<WingColor, { label: string; color: string }> = {
  RED: { label: 'RED', color: WING_COLORS.RED },
  ORANGE: { label: 'ORANGE', color: WING_COLORS.ORANGE },
  PURPLE: { label: 'PURPLE', color: WING_COLORS.PURPLE },
  BLUE: { label: 'BLUE', color: WING_COLORS.BLUE },
}

/** Cycled to tint the group bars in the admin member table. */
export const GROUP_BAR_COLORS = [
  'var(--c-primary)',
  'var(--wing-orange)',
  'var(--c-success)',
  'var(--wing-purple)',
  'var(--c-danger)',
  'var(--c-teal)',
  'var(--c-magenta)',
  'var(--c-blue-deep)',
]
