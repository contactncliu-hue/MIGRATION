import type { LanguageCode, LanguageStrings } from '../types/user'

export const languageOptions: { code: LanguageCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'pt-BR', label: 'Português (BR)' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ko', label: '한국어' },
  { code: 'zh-CN', label: '中文' },
]

/**
 * `transfer` means moving a game account to this server — not a money
 * transfer. The earlier wording ("이체" / "转账" / "Chuyển khoản") was the
 * banking sense and read as the wrong feature entirely.
 */
export const translations: Record<LanguageCode, LanguageStrings> = {
  en: {
    welcome: 'Welcome',
    homepage: 'Homepage',
    transfer: 'Migration',
    logout: 'Log out',
    loggingOut: 'Logging out...',
    guest: 'Guest',
    browsing: 'Browsing as',
    login: 'Log in',
    applyCta: 'Apply to migrate',
    statusCta: 'Check my status',
  },
  fr: {
    welcome: 'Bienvenue',
    homepage: 'Accueil',
    transfer: 'Migration',
    logout: 'Déconnexion',
    loggingOut: 'Déconnexion...',
    guest: 'Invité',
    browsing: 'Navigation en tant que',
    login: 'Connexion',
    applyCta: 'Demander une migration',
    statusCta: 'Voir mon statut',
  },
  'pt-BR': {
    welcome: 'Bem-vindo',
    homepage: 'Início',
    transfer: 'Migração',
    logout: 'Sair',
    loggingOut: 'Saindo...',
    guest: 'Visitante',
    browsing: 'Navegando como',
    login: 'Entrar',
    applyCta: 'Solicitar migração',
    statusCta: 'Ver meu status',
  },
  vi: {
    welcome: 'Chào mừng',
    homepage: 'Trang chủ',
    transfer: 'Chuyển máy chủ',
    logout: 'Đăng xuất',
    loggingOut: 'Đang đăng xuất...',
    guest: 'Khách',
    browsing: 'Đang xem với tư cách',
    login: 'Đăng nhập',
    applyCta: 'Đăng ký chuyển máy chủ',
    statusCta: 'Kiểm tra trạng thái',
  },
  ko: {
    welcome: '환영합니다',
    homepage: '홈',
    transfer: '서버 이주',
    logout: '로그아웃',
    loggingOut: '로그아웃 중...',
    guest: '게스트',
    browsing: '게스트로 보는 중',
    login: '로그인',
    applyCta: '이주 신청하기',
    statusCta: '내 신청 상태',
  },
  'zh-CN': {
    welcome: '欢迎',
    homepage: '首页',
    transfer: '转服',
    logout: '登出',
    loggingOut: '正在登出...',
    guest: '访客',
    browsing: '以访客身份浏览',
    login: '登录',
    applyCta: '申请转服',
    statusCta: '查询申请状态',
  },
}
