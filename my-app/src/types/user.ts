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
  serverTimeNotice: string
  migrationBtnLabel: string
  checkStatusBtnLabel: string
  wingRed: string
  wingOrange: string
  wingPurple: string
  wingBlue: string
  total: string
  soloType: string
  groupType: string
  allianceTag: string
  faction: string
  addMember: string
  removeMember: string
  memberLabel: string
  uidLabel: string
  uidPlaceholder: string
  statusPending: string
  statusApproved: string
  statusRejected: string

  // --- Migration form modal ---
  migrationModalTitle: string
  migrationModalSubtitle: string
  soloTransferBtn: string
  groupTransferBtn: string
  groupNameLabel: string
  groupNamePlaceholder: string
  usernameLabel: string
  prevAllianceLabel: string
  prevServerLabel: string
  prevServerPlaceholder: string
  killCountLabel: string
  killCountPlaceholder: string
  roleLabel: string
  migrationScoreLabel: string
  f1PowerLabel: string
  f2PowerLabel: string
  addMemberBtn: string
  errorFillAllianceTag: string
  errorFillAllFields: string
  sendingLabel: string
  sendLabel: string

  // --- UID lookup modal ---
  checkStatusModalTitle: string
  checkStatusModalSubtitle: string
  uidPlaceholderExample: string
  errorEnterUid: string
  errorNoRequestFound: string
  searchingLabel: string
  searchLabel: string

  // --- Wing status card ---
  closeLabel: string
}
