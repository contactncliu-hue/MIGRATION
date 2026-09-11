# MIGRATION (zoo) — 핸드오프

## 📍 포인터

| 무엇 | 어디 |
|---|---|
| 앱 | `my-app/` — React 19 · TS · Vite 8 · Supabase · Vercel |
| 디자인 SoT | `src/styles/tokens.css` — 색·타이포·간격·컨트롤 높이 |
| 공용 UI (소유자) | `src/components/ui/` — Modal·Field·FormMessage·Badge·Panel·forms.css |
| 도메인 상수 | `src/lib/` — wings.ts · migration.ts · admin.ts |
| 인증 | `src/lib/auth.tsx` + `auth-context.ts`(useAuth) |
| CSS 스코프 게이트 | `scripts/check-css-scope.mjs` — `npm run build` 가 먼저 실행 |
| 사고 이력·측정 | `.tasks/archive/` |
| 별개 프로젝트 | `~/work_space/one-darkwar` — 같은 스택의 **다른** 서비스. 합치지 않기로 결정 |

## 지금 한 줄

토대·화면 정리 완료(커밋 `7414877` → `d85f898` → `265a861`).
인증 단일화 · 토큰 69개 · 공용 컴포넌트 10개 · 타이포 위계 교정 ·
MIGRATION 버튼 축소 재배치 · 로그인 아트워크 복구 및 폼 카드화.
색톤은 원 작업자 것을 한 톤도 바꾸지 않았다. 빌드·스코프 게이트 통과.

## 다음 1수

1. **HomePage 채우기** — 텍스트 한 줄뿐인 유일한 빈 화면이다. 원본 `index.html`(25KB)
   이식 vs 신규 설계를 사용자가 아직 고르지 않았다.
2. **RLS 확인** — 1번보다 급하지만 내가 못 한다(대시보드 작업). 아래 룰북 참조.
3. 번역 오류 수정 — `transfer` 가 ko "이체"/zh "转账"/vi "Chuyển khoản"(= 은행 송금).
   서버 이주 맥락과 다르다. `src/lib/translations.ts`. 화면에 바로 보이므로 3번.

## 룰북

- 🔴 **색·크기를 페이지 CSS에 직접 쓰지 마라.** `tokens.css` 에 추가하고 `var()` 로 참조한다.
  현재 CSS 색·폰트 px 하드코딩 0건(아트워크 비례용 `vw` 제외).
- 🔴 **페이지 CSS에 전역 셀렉터를 쓰지 마라.** Vite 가 모든 CSS를 함께 번들한다.
  같은 사고가 **세 번** 났다(`body{overflow:hidden}` · `.scene{pointer-events:none}` ·
  `.scene{opacity:0}`). 이제 빌드 게이트가 막고, 과거 3건 재현으로 검증했다.
  공용 프리미티브는 `components/ui/` 소유 — 페이지는 `.login-form .field` 처럼 스코프해 쓴다.
- 🔴 **브라우저 도구의 `getComputedStyle` 을 믿지 마라.** `.scene` 과 `.login-form` 둘 다
  계산값 `opacity:0` 인데 화면은 정상이었다. 두 번 다 버그로 오인해 한참 팠다.
  ⇒ **스크린샷으로 판정한다.**
- 헤드리스 캡처(`scratchpad/shoot.mjs`)는 React 클릭을 재현하지 못한다.
  모달·폼은 `css` 옵션으로 상태를 강제해 찍는다.
- 권한은 `useAuth()` 하나만 쓴다. 페이지에서 `supabase.auth.getUser()` 를 직접 부르지 않는다.
  **클라이언트 체크는 UX 게이트일 뿐 — 실제 방어선은 RLS다.**
- 모달은 부모가 `{open && <Modal/>}` 로 조건부 렌더한다. state 리셋 effect 를 두지 않는다.
- 타이포 위계: 라벨(`--fs-label`)은 그것이 설명하는 값(`--fs-md`)보다 **작다**.

## ⚠️ 미해결 (내가 못 고치는 것)

- 🔴 **RLS 미확인** — 레포가 public(`contactncliu-hue/MIGRATION`)이고 `.env` 가 커밋
  `4c0d207` 히스토리에 남아 있다. 익명으로 `migration_members` 조회가 실제로 된다.
  ⇒ Supabase 대시보드 → Authentication → Policies. 안 켜져 있으면 누구나 읽고 쓴다.
- 이 repo 에 SQL/스키마 파일이 없다 — DB 구조가 코드로 추적되지 않는다.
- 번들 503KB 단일 청크(코드 스플리팅 없음).
