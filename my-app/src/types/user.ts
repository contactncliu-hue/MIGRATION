export type UserRole = 'admin' | 'member' | 'guest'

export interface UserProfile {
  displayName: string
  role: UserRole
}

export type LanguageCode = 'en' | 'fr' | 'pt-BR' | 'vi' | 'ko' | 'zh-CN'

export interface LanguageStrings {
  welcome: string
  homepage: string
  transfer: string
  logout: string
  loggingOut: string
}
