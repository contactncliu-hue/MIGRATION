# MIGRATION (zoo) — 핸드오프

## 📍 포인터

| 무엇 | 어디 |
|---|---|
| 앱 | `my-app/` — React 19 · TS · Vite 8 · Supabase |
| 배포 | **루트 `vercel.json`** 이 my-app 을 빌드한다 (대시보드 Root Directory 설정 불필요) |
| 디자인 SoT | `src/styles/tokens.css` · 폰트는 `styles/fonts.css` |
| 공용 UI (소유자) | `src/components/ui/` — Modal·Field·FormMessage·Badge·Panel·forms.css |
| 도메인 상수 | `src/lib/` — wings · migration · admin · schedule(이벤트 시각 SoT) |
| 인증 | `src/lib/auth.tsx` + `auth-context.ts`(useAuth) |
| CSS 스코프 게이트 | `scripts/check-css-scope.mjs` — `npm run build` 가 먼저 실행 |
| 홈 기획 | `.tasks/backlog.md` |
| 사고 이력 | `.tasks/archive/` |
| 별개 프로젝트 | `~/work_space/one-darkwar` — 같은 스택의 **다른** 서비스. RLS 61개·RPC 4개 참고용 |

## 지금 한 줄

화면 5종(로그인·홈·이주·어드민) 구현 완료, main 에 push 됨.
루트 레거시 HTML 43개 제거하고 배포를 my-app 으로 넘겼다.
**아직 서비스에는 안 보인다** — Vercel 환경변수 2개가 없으면 데이터가 안 나온다.

## 다음 1수

1. **Vercel 환경변수** — 없으면 화면만 뜨고 전부 실패한다. 배포 성패가 여기 달렸다.
2. **RLS 확인** — public 레포 + anon key. 익명으로 `migration_members` 가 읽힌다.
   one-darkwar 의 `transfer insert anyone` + `select admin` 정책을 그대로 쓰면 된다.
3. **에셋 경량화** — 홈 1회 32.4MB(`실측`). `header-red` 5.7MB/4443px 를 900px 로 그린다.

## 룰북

- 🔴 **색·크기를 페이지 CSS 에 직접 쓰지 마라.** `tokens.css` 에 토큰을 추가하고 `var()` 로.
- 🔴 **페이지 CSS 에 전역 셀렉터를 쓰지 마라.** Vite 가 모든 CSS 를 함께 번들한다.
  같은 사고가 **세 번** 났다(`body{overflow:hidden}` · `.scene{pointer-events:none}` ·
  `.scene{opacity:0}`). 이제 빌드 게이트가 막고, 과거 3건 재현으로 검증했다.
  홈처럼 새 화면은 `.home-` 식 접두사를 쓴다. 공용은 `components/ui/` 소유.
- 🔴 **브라우저 도구의 `getComputedStyle` 을 믿지 마라.** `.scene`·`.login-form` 둘 다
  계산값 `opacity:0` 인데 화면은 정상이었다. 두 번 다 버그로 오인해 한참 팠다.
  ⇒ **스크린샷으로 판정한다.**
- 헤드리스 캡처(`scratchpad/shoot.mjs`)는 React 클릭을 재현하지 못한다.
  모달·폼은 `css` 옵션으로 상태를 강제해 찍는다.
- 권한은 `useAuth()` 하나만. 페이지에서 `supabase.auth.getUser()` 직접 호출 금지.
  **클라이언트 체크는 UX 게이트일 뿐 — 실제 방어선은 RLS 다.**
- 모달은 부모가 `{open && <Modal/>}` 로 조건부 렌더한다. state 리셋 effect 를 두지 않는다.
- 타이포 위계: 라벨(`--fs-label`)은 그것이 설명하는 값(`--fs-md`)보다 **작다**.
- 이벤트 시각은 `lib/schedule.ts` 한 곳. ⛔ 카운트다운을 만들지 마라 — 타임존 기준이
  어디에도 정의돼 있지 않아 틀리면 사람들이 이벤트를 놓친다.

## ⚠️ 내가 못 하는 것 (사용자만 가능)

- **Vercel 환경변수** `VITE_SUPABASE_URL` · `VITE_SUPABASE_ANON_KEY`
  (Settings → Environment Variables. 값은 Supabase → Settings → API)
- **RLS 정책** — Supabase 대시보드에서 SQL 실행
- 이 repo 에 SQL/스키마 파일이 없다. DB 구조가 코드로 추적되지 않는다.
