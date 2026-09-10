import type { LanguageCode, LanguageStrings } from '../types/user'

export const languageOptions: { code: LanguageCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'pt-BR', label: 'Português (BR)' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ko', label: '한국어' },
  { code: 'zh-CN', label: '中文' },
]

export const translations: Record<LanguageCode, LanguageStrings> = {
  en: { welcome: 'Welcome', homepage: 'Homepage', transfer: 'Transfer', logout: 'Log out', loggingOut: 'Logging out...' },
  fr: { welcome: 'Bienvenue', homepage: 'Accueil', transfer: 'Transfert', logout: 'Déconnexion', loggingOut: 'Déconnexion...' },
  'pt-BR': { welcome: 'Bem-vindo', homepage: 'Início', transfer: 'Transferência', logout: 'Sair', loggingOut: 'Saindo...' },
  vi: { welcome: 'Chào mừng', homepage: 'Trang chủ', transfer: 'Chuyển khoản', logout: 'Đăng xuất', loggingOut: 'Đang đăng xuất...' },
  ko: { welcome: '환영합니다', homepage: '홈페이지', transfer: '이체', logout: '로그아웃', loggingOut: '로그아웃 중...' },
  'zh-CN': { welcome: '欢迎', homepage: '首页', transfer: '转账', logout: '登出', loggingOut: '正在登出...' },
}
