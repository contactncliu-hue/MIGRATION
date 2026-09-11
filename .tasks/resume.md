# MIGRATION (zoo) — 핸드오프

> 이 파일은 **덮어쓴다**. 이력은 쌓지 않는다.

## 포인터

| 무엇 | 어디 |
|---|---|
| 앱 루트 | `my-app/` (React 19 + TS + Vite 8 + Supabase) |
| 디자인 SoT | `my-app/src/styles/tokens.css` — 색·타이포·간격·컨트롤 높이 |
| 공용 UI | `my-app/src/components/ui/` — Modal·Field·FormMessage·Badge·Panel |
| 도메인 상수 | `my-app/src/lib/wings.ts`, `lib/migration.ts`, `lib/admin.ts` |
| 인증 | `lib/auth.tsx`(Provider) + `lib/auth-context.ts`(useAuth) |
| 배포 | `my-app/vercel.json` — SPA rewrite (`/api/` 제외) |
| 별개 프로젝트 | `~/work_space/one-darkwar` — 같은 스택의 **다른** 서비스. 합치지 않기로 결정 |

## 지금 한 줄

토대 + 화면 정리 완료 — 인증 단일화 · 디자인 토큰 · 공용 컴포넌트 10개 · 타이포 위계 교정 ·
MIGRATION 버튼 26%→17%(항아리 하단) · 로그인 하단 아트워크 복구 및 확대.
색톤은 원 작업자 것을 한 톤도 바꾸지 않았다.

## 다음 1수

**HomePage 채우기.** 현재 텍스트 한 줄(9줄짜리 파일)뿐이다.
원본 `index.html`(25KB) 이식 vs 신규 설계 — 사용자 선택 대기 중.

## 룰북

- 🔴 **색·크기를 페이지 CSS에 직접 쓰지 마라.** `tokens.css`에 토큰을 추가하고 `var()`로 참조한다.
  현재 CSS 색 하드코딩 0건 · 폰트 px 하드코딩 0건(아트워크 비례용 `vw` 제외).
- 🔴 **페이지 CSS에 전역 셀렉터(`body`, `*`, 공용 클래스명)를 쓰지 마라.**
  Vite가 모든 CSS를 함께 번들하므로 다른 화면을 오염시킨다.
  실제로 **세 건**이 있었다 —
  ① `LoginPage.css`의 `body{overflow:hidden}` → 모든 화면 스크롤 잠금
  ② `LoginPage.css`의 `.scene{pointer-events:none}` → TransferPage의 MIGRATION 버튼 클릭 불가
  ③ `TransferPage.css`의 `.scene{opacity:0}` → 로그인 화면 배경 아트워크가 통째로 안 보임
  `.scene` 은 **두 화면이 같은 클래스명을 서로 다른 용도로** 쓰고 있었다. 셋 다 스코프로 해결.
- 권한 체크는 `useAuth()` 하나만 쓴다. 페이지에서 `supabase.auth.getUser()`를 직접 부르지 않는다.
  **클라이언트 체크는 UX 게이트일 뿐 — 실제 방어선은 RLS다.**
- 모달은 부모가 `{open && <Modal .../>}`로 조건부 렌더한다. state 리셋 effect를 두지 않는다.
- 타이포 위계: 라벨(`--fs-label`)은 그것이 설명하는 값(`--fs-md`)보다 **작다**.

## ⚠️ 미해결

1. 🔴 **RLS 미확인** — 레포가 public(`contactncliu-hue/MIGRATION`)이고 `.env`가 커밋 `4c0d207`
   히스토리에 남아 있다. 익명 상태로 `migration_members` 조회가 실제로 된다(윙 카드 4행).
   → Supabase 대시보드 → Authentication → Policies 확인 필요.
2. 번역 오류 — `transfer`가 ko "이체" / zh "转账" / vi "Chuyển khoản" = **은행 송금** 뜻.
   서버 이주 맥락에 안 맞는다. `lib/translations.ts`.
3. 번들 503KB 단일 청크 — 코드 스플리팅 없음.
4. 이 repo에 SQL/스키마 파일이 하나도 없다 — DB 구조가 코드로 추적되지 않는다.
