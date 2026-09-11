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
}
