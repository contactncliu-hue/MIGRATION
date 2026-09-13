export type UserRole = 'admin' | 'member' | 'guest'

export interface UserProfile {
  displayName: string
  role: UserRole
}

export type LanguageCode = 'en' | 'fr' | 'pt-BR' | 'vi' | 'ko' | 'zh-CN'

export interface LanguageStrings {
  welcome: string
  homepage: string
  /** Server migration — not a money transfer. */
  transfer: string
  logout: string
  loggingOut: string
  /** Shown instead of a name when nobody is signed in. */
  guest: string
  /** Caption above "Guest" — explains what viewing as a guest means. */
  browsing: string
  login: string
  /** Home call-to-action for visitors who came to apply. */
  applyCta: string
  /** Home call-to-action for visitors checking an existing application. */
  statusCta: string
  /** Admin area — was hardcoded English in the sidebar. */
  admin: string
  language: string

  // --- Transfer / migration page ---
  /** Notice above the hero art: server time may differ, subject to change. */
  serverTimeNotice: string
  /** Label on the main image button that opens the migration form. */
  migrationBtnLabel: string
  /** Label on the button that opens the status card. */
  checkStatusBtnLabel: string
  /** Wing/faction color names shown in the status card rows. */
  wingRed: string
  wingOrange: string
  wingPurple: string
  wingBlue: string
  /** "Total" line at the bottom of the status card. */
  total: string
  /** Solo/Group toggle on the migration form. */
  soloType: string
  groupType: string
  /** Alliance tag field label, shown only for group applications. */
  allianceTag: string
  /** Faction picker label on each member row. */
  faction: string
  addMember: string
  removeMember: string
  /** Header label on each member row (e.g. "Member 1"). */
  memberLabel: string
  uidLabel: string
  uidPlaceholder: string
  /** Result states shown after a UID status lookup. */
  statusPending: string
  statusApproved: string
  statusRejected: string
}
