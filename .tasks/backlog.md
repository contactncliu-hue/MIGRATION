# MIGRATION (zoo) — Backlog

> **상태** — 유효 · 2026-09-11 기준 · 등록된 기능 1개(HomePage) · 착수 0건
> 다음 1수는 `.tasks/resume.md` 가 SSOT다. 이 파일은 **무엇을 어떤 순서로** 만들지만 적는다.
> 태스크를 시작하면 `- [ ]` → `- [x]` 로 바꾸고, 완료 wave 는 절 제목에 `(완료)` 를 붙인다.

> ⚠️ **독립성 고지** — 받은 지시문에 해법 후보가 섞여 있었다:
> "포털 3개를 **기능 진입점으로 쓸지, 순수 비주얼로 둘지**" (이지선다) ·
> "번들 503KB — 무거운 의존성 추가는 근거를 대라" (성능 병목을 JS로 지목).
> 두 프레이밍을 그대로 따르지 않았다. 아래 §2·§5 가 독립 판단이다.

---

## HomePage — 2026-09-11 등록

### 0. 사전 실측 — 기획을 바꾼 세 가지

| # | 발견 | 근거 |
|---|---|---|
| 1 | **포털 3개는 내용이 완전히 동일하다.** 아이콘 3종·시각(01:00/10:00 · 10:30 · 10:30/22:30)이 세 장 모두 같고 **색만 purple/red/green 으로 다르다** | `실측(icons-{purple,red,green}.PNG 3장 축소 후 시각 대조)` |
| 2 | **홈의 진짜 콘텐츠는 "서버 이벤트 시간표"** 이고, 그 데이터는 **DB 어디에도 없다 — PNG 안에 구워져 있다** | `실측(icons-*.PNG 이미지 판독 + 코드 전체에 events 테이블 참조 0건)` |
| 3 | **성능 병목은 JS가 아니라 이미지다.** 홈 캐러셀 에셋 12장 = **26.6MB**. `header-red.PNG` 는 5.8MB·4443px 폭인데 화면엔 `max-width:900px` 로 그린다(4.9배 오버사이즈) | `실측(ls -la my-app/public/assets 합산 · sips 픽셀 조회 · index.html CSS)` |

→ 1번 때문에 오늘의 캐러셀은 **정보량 0**이다. 같은 시간표를 세 번 보여주려고 26.6MB를 쓴다.

### ⚠️ conventions 부재 (보고)
- 프로젝트 `.claude/` 에 **conventions 스킬이 없다**(`launch.json` 만 있음). 루트 `CLAUDE.md` 도 없다.
- 전역 `ts-vite-react` 스킬을 태그 SSOT로 썼으나 **그 스킬의 전제와 실제 코드가 다르다** —
  스킬은 TanStack Router/Query/Zustand 전제, 실제는 `react-router-dom` + 수제 `useState/useEffect` + `lib/`.
  `실측(package.json 에 tanstack·zustand 0건 · src/{api,queries,stores} 디렉터리 없음)`
- 매핑: `[API]`→`src/lib/*.ts` 순수 호출 · `[Query]`→`src/lib/use*.ts` 경량 훅(스킬 래칫이 명시 허용) ·
  `[Store]` 미사용 · **`[Asset]` 은 체계에 없어 확장해 쓴다**.

---

### 1. 홈이 해야 할 일

**한 줄: "지금 내가 뭘 해야 하나"를 3초에 준다.**

| 화면 | 성격 | 방문 빈도 |
|---|---|---|
| **HomePage** | 이벤트 시간표 · 윙 여석 · 내 신청 상태 | **매일 반복** |
| TransferPage | 이주 신청 · UID 조회 | 1회성 |
| AdminPage | 운영 | 관리자만 |

이주 신청은 **한 번 하면 끝**이다. 홈이 "신청 랜딩"이면 신청한 사람은 다시 올 이유가 없다.
원본 아트워크가 이미 답을 갖고 있다 — **이벤트 시간표**가 반복 방문 이유다.

기존 기능과의 관계: 홈은 **대체하지 않고 요약·진입만** 한다.
- 윙 현황: 트랜스퍼의 `WingStatusCard`(펼침 카드) ↔ 홈의 요약 4줄 — **같은 데이터원, 다른 표현**
- 신청·조회: 홈은 진입점만 두고 실제 모달은 TransferPage 소유 유지

### 2. 포털 3개에 무엇을 붙이나 — 이지선다를 받지 않았다

**기각 ① 포털 = 윙.** 포털은 purple/red/green **3개**, 윙은 RED/ORANGE/PURPLE/BLUE **4개**.
green은 윙이 아니고 orange·blue는 포털이 없다. `실측(wings.ts WING_ORDER vs index.html .portal 3개)`

**기각 ② 순수 비주얼.** 아이콘 PNG 안에 이미 시각이 박혀 있다 — 이건 **정보 슬롯**이다.
비주얼로 확정하면 26.6MB짜리 장식이 되고, 시간 바꿀 때마다 디자이너가 PNG를 다시 뽑아야 한다.

**기각 ③ 포털 = 기능 진입점 3개.** 포털 하나가 680×894px를 먹는데 버튼으로 쓰는 건 낭비고,
**캐러셀은 한 번에 하나만 보인다 — 진입점을 숨기는 구조**다. 진입점은 항상 보여야 한다.

**채택 — 포털 = 날짜 탭 (중앙=오늘 · 좌=어제 · 우=내일).**
- 원본이 `active = 1`(가운데 red)로 시작하는 것과 정확히 맞는다 `실측(index.html script)`
- 캐러셀 애니메이션·에셋·화살표 **전부 그대로 산다** (제약 1 충족 — 순수 CSS transition 유지)
- 3장이 **처음으로 서로 다른 내용**을 갖는다 → 좌우로 넘기는 행위에 의미가 생긴다
- 색은 그대로 두고 날짜 구분자로 재해석 — 아트워크 한 장도 안 버린다

**진입점은 포털이 아니라 그 아래 고정 액션 바에 둔다** (캐러셀 상태와 무관하게 항상 노출).

> 🔴 **미확인 · 사용자 결정 1건** — 원작자가 3색을 무엇으로 의도했는지 repo에 근거가 없다.
> "날짜 3칸"은 내 추론이다. 대안: 3색 = 이벤트 **카테고리** 3종(일일/주간/연맹).
> T-08 착수 전에 이것만 정하면 된다.

### 3. 데이터와 출처

| 홈에 필요한 것 | 출처 | 상태 |
|---|---|---|
| 윙 여석 (4색 n/m) | `wing_config` + `migration_members` + `wing_status` | ✅ 기존 — 단 집계 방식을 바꿔야 한다(T-06) |
| pending 건수 (관리자) | `migration_members.status` | ✅ 기존 — count만 |
| **이벤트 시간표** | **없음 — PNG에 구워져 있다** | 🔴 **신규 테이블 `server_events`** (T-09) |
| **내 이주 상태** | **잇는 길이 없다** | 🔴 **신규 컬럼 필요** (T-13 참조) |

🔴 **스키마 갭 — `migration_members` 에 `profiles.id` 로 가는 외래키가 없다.**
`실측(lib/admin.ts Member 인터페이스에 user_id·profile_id 0건)`
로그인 계정 ↔ 신청 행을 잇는 방법이 **현재 없다.** `UidLookupModal` 이 UID를 손으로 받는 이유가 이것이다.
선택지: (a) `migration_members.user_id uuid` 신규 (b) `profiles.uid text` 신규
(c) 스키마 무변경 — localStorage 에 UID 기억(기기 바뀌면 깨짐).

### 4. 게스트 / 멤버 / 관리자

원칙: **홈에서는 개인 식별 데이터를 집계 외 형태로 절대 렌더하지 않는다.**
홈은 비로그인 기본 진입 화면이라 **노출면이 가장 넓은 곳**이다.

| | 게스트 | 멤버 | 관리자 |
|---|---|---|---|
| 이벤트 시간표 | ✅ (공개 정보) | ✅ | ✅ |
| 윙 여석 막대 n/m | ✅ (개인 식별 불가) | ✅ | ✅ |
| 윙 Total 합계 | ❌ | ❌ | ✅ (`WingStatusCard` 기존 규칙과 동일) |
| 내 이주 상태 | ❌ | ✅ (본인 1행) | ✅ |
| pending 건수 | ❌ | ❌ | ✅ (**count만 — 목록 금지**) |
| **UID · username · f1/f2_power · 신청자 명단** | ❌ | ❌ | ❌ (홈에는 어느 역할도 금지) |

🔴 **그러나 클라이언트 게이트는 방어가 아니다.** 현재 `WingStatusCard` 는
`migration_members` **전행을 익명 키로 내려받아** 클라이언트에서 센다 `실측(WingStatusCard.load)`.
이 로직을 그대로 홈에 붙이면 **첫 화면 기본 요청**이 된다 — 네트워크 탭에 전 명단이 남는다.
⇒ **T-06(서버 집계 RPC)이 P0인 이유다.** RLS를 못 켜는 동안 노출면을 줄이는 유일한 실질 조치.
⇒ **RLS 확인 전까지 "내 상태" 카드(T-13)는 착수하지 않는다.**

### 5. 성능 — 제약 4를 재프레임한다

지시문은 "번들 503KB, 무거운 의존성 추가는 근거를 대라"였다. **스케일이 틀렸다.**

- 홈 캐러셀 에셋 **26.6MB** + scene-left 4.4MB + scene-right 3.0MB + sidebar 2.2MB ≈ **36MB**
- JS 503KB 는 그 옆에서 **1.4%** 다. 이미지가 26MB인데 JS를 쪼개는 건 순서가 틀렸다.
- **의존성은 0개 추가한다** — 캐러셀은 순수 CSS transition + 상태 1개(active index)면 된다.
  `react-router-dom` 외에 아무것도 필요 없다. (근거를 댈 의존성 자체가 없다)
- 실제 레버: PNG→WebP + 렌더 크기 리사이즈(T-01) · 중앙 외 lazy(T-12).

---

## 📱 화면/메뉴 구조

```
/ (HomePage)                       ← 게스트 포함 전원의 첫 화면
├── HomeScene            배경 아트워크 (scene-left/right · bottom-fade)   [.home-scene 스코프]
├── LineupNote           "Time can be subject to change"
├── PortalCarousel       ← 원본 캐러셀 (순수 CSS · 에셋 12장 유지)
│   ├── NavArrow ×2      좌/우 + 키보드 ←/→
│   └── PortalCard ×3    pos-center | pos-left | pos-right
│       ├── portal-title / portal-header / portal-arch   (아트워크)
│       └── EventTimeList  ← icons PNG → DOM (P1, T-11)
├── HomeActionBar        캐러셀 위 고정 — 캐러셀 상태와 독립
│   ├── MIGRATION        → /transfer
│   ├── CHECK STATUS     → /transfer (UID 조회)
│   └── WING STATUS      → WingSummaryStrip 토글
├── WingSummaryStrip     윙 4색 n/m  (Total 은 admin)
├── HomeStatusLine       "YOUR MIGRATION: APPROVED"   (멤버 · P2 · RLS 대기)
└── AdminPendingBadge    "3 PENDING" → /admin         (admin · P2)
```

## 📋 태스크 목록

### P0 — 핵심 (이것만으로 목표 1회 달성: "홈에 오면 일정이 보이고 신청까지 갈 수 있다")

- [ ] `[Asset]` 캐러셀 PNG 12장 WebP 변환 + 렌더 크기 리사이즈 | 2h | wave:1 | deps:없음
      · 목표 폭(2x): arch 1360 · header 1800 · title 710 · icons 626. 현재 header-red 는 4443px.
      · **P0 이유**: 홈은 전 방문자의 첫 화면이고 길드원 상당수가 모바일이다. 36MB는 이탈이다.
      · QA: 홈 첫 로드 네트워크 합계가 26.6MB → 3MB 미만이고, 세 포털에 육안 차이가 없다.
- [ ] `[Component]` PortalCard — 4레이어(title/header/arch/icons) + pos-center|left|right | 3h | wave:1 | deps:없음
      · 원본 `.portal` CSS 그대로 옮기되 **클래스명을 `.home-portal` 로 리네임**.
      · 🔴 `.scene`·`.carousel`·`.bottom-fade` 는 Login/Transfer 가 이미 쓴다 — 전역 오염 3건 전례.
      · QA: 홈에서 3장이 겹침·잘림 없이 좌/중/우에 배치된다.
- [ ] `[API]` 윙 집계를 서버로 — `get_wing_occupancy()` RPC + `lib/wings.ts` 호출 함수 | 3h | wave:2 | deps:없음
      · 🔴 지금은 `migration_members` **전행**을 익명으로 내려받아 센다. 홈에 붙이면 기본 요청이 된다.
      · RPC가 `{color, count, capacity}` 만 반환 — 오버라이드(`wing_status`) 우선 규칙도 서버로.
      · ⚠️ **사용자가 Supabase 대시보드에서 SQL을 실행해야 한다** (내가 못 하는 부분).
      · **P0 이유**: RLS를 못 켜는 동안 노출면을 줄이는 유일한 실질 조치다.
      · QA: 홈 네트워크 탭에 `migration_members` 행이 하나도 안 보이고 윙 막대는 정상 표시된다.
- [ ] `[Component]` PortalCarousel — active index + 화살표 + 카드 클릭 이동 + 키보드 ←/→ | 3h | wave:2 | deps:PortalCard
      · 원본 `render()` 의 모듈로 인덱스 로직 그대로(`(i - active + n) % n`).
      · QA: 화살표를 누르면 가운데 포털이 약 1.1s 커브로 바뀌고 좌우 포털이 반쯤 잘려 보인다.
- [ ] `[Page]` HomePage 셰이프 — 캐러셀 + 배경 + bottom-fade + lineup-note 조립 | 3h | wave:3 | deps:PortalCarousel
      · `npm run check:css` 가 스코프를 판정한다(빌드가 먼저 돌린다).
      · QA: `/` 가 원본 index.html 과 레이아웃이 일치하고, `/login`·`/transfer` 가 깨지지 않는다.
- [ ] `[Component]` HomeActionBar — MIGRATION / CHECK STATUS / WING STATUS 진입점 | 2h | wave:3 | deps:없음
      · 캐러셀 위 z-index, 캐러셀 상태와 독립. 게스트에게도 전부 보인다.
      · QA: 비로그인으로 `/` 에 들어가 **사이드바를 열지 않고** 이주 신청까지 2클릭에 도달한다.
- [ ] `[Component]` WingSummaryStrip — 윙 4색 여석 요약 (Total 은 admin) | 2h | wave:3 | deps:`get_wing_occupancy()` RPC
      · `WingStatusCard` 와 같은 데이터원, 다른 표현. 두 곳이 `lib/wings.ts` 하나를 공유한다.
      · QA: 게스트로 보면 4색 막대와 n/m 만, 관리자로 보면 아래에 Total 한 줄이 더 붙는다.

**P0 소계 18h**

### P1 — 중요 (포털에 실제 정보가 들어간다)

- [ ] `[Component]` 포털 이미지 lazy — 중앙 외 2장 `loading="lazy"`, 인접만 프리로드 | 2h | wave:4 | deps:PNG WebP 변환
      · QA: 첫 로드에 포털 에셋이 4장만 받아지고, 화살표를 누르면 다음 세트가 받아진다.
- [ ] `[Component]` 모바일 캐러셀 규칙 이식 검증 (≤760px) | 2h | wave:4 | deps:PortalCarousel
      · 원본은 모바일에서 좌우 포털을 **상단에 매달고**(`top:0`) `::after` 로 하단 페이드를 준다.
        이 규칙이 빠지면 모바일에서 겹쳐 보인다 — 이식 누락이 가장 나기 쉬운 지점.
      · QA: 375px 폭에서 좌우 포털이 화면 위쪽에 얇게 붙고 가운데 포털이 잘리지 않는다.
- [ ] `[Type]` `ServerEvent` 타입 + `EVENT_ICONS` 아이콘 키 매핑 + i18n 라벨 키 | 2h | wave:4 | deps:**§2 미확인 결정**
      · `{ id, daySlot: 0|1|2, iconKey, labelKey, times: string[], sortOrder }`
      · 🔴 착수 전 사용자가 "포털 3색 = 날짜 / 카테고리" 를 정해야 한다.
      · QA: 없음(타입) — `npx tsc --noEmit` 통과.
- [ ] `[API]` **신규 테이블** `server_events` + `fetchServerEvents()` | 3h | wave:5 | deps:`ServerEvent` 타입
      · 🔴 **이 repo에 SQL/스키마 파일이 없다.** 이 테이블은 **새로 만드는 것**이며 기존 5개 테이블과 무관하다.
      · 공개 데이터이므로 anon read 허용 · write는 admin만 — **이 테이블에는 RLS를 처음부터 건다.**
      · QA: SQL로 한 행의 시각을 바꾸면 새로고침 시 홈 포털의 시각이 따라 바뀐다.
- [ ] `[Query]` `useServerEvents()` 경량 훅 | 2h | wave:5 | deps:`fetchServerEvents()`
      · TanStack Query 미설치 — `{data, loading, error}` 인터페이스로 자체 구현(conventions 래칫 허용 형태).
      · QA: 홈을 두 번 오가도 요청이 중복 발사되지 않는다.
- [ ] `[Component]` EventTimeList — icons PNG 를 DOM 으로 교체 | 3h | wave:6 | deps:`useServerEvents()`
      · ⚠️ 아이콘 3종이 PNG **한 장에 뭉쳐** 있다. 분리 에셋 전이면 PNG 위에 시각만 DOM 오버레이하는
        단계적 전환도 가능 — 어느 쪽인지는 위 결정에 딸린다.
      · QA: 세 포털이 **서로 다른** 시각을 보여준다(현재는 셋 다 01:00/10:00 · 10:30 · 10:30/22:30 동일).

**P1 소계 14h**

### P2 — 부가 (RLS 확인 이후)

- [ ] `[Component]` HomeStatusLine — 로그인 멤버의 내 이주 상태 한 줄 | 3h | wave:7 | deps:**RLS 확인**(사용자만 가능)
      · 🔴 **스키마 갭으로 막혀 있다** — 계정↔신청 행을 잇는 외래키가 없다(§3 참조).
      · ⚠️ RLS 미확인 상태에서 "본인 행만"을 클라이언트로 거르는 것은 방어가 아니다. **착수 금지.**
      · QA: 로그인하면 홈 상단에 "YOUR MIGRATION: APPROVED" 가 뜨고 로그아웃하면 사라진다.
- [ ] `[Component]` AdminPendingBadge — pending **건수만** + /admin 바로가기 | 2h | wave:7 | deps:`get_wing_occupancy()` RPC
      · `get_pending_count()` 로 숫자만 받는다. **목록은 홈에 절대 내리지 않는다.**
      · QA: 관리자로 로그인했을 때만 "3 PENDING" 배지가 보이고 클릭 시 /admin 으로 간다.

**P2 소계 5h · 전체 37h**

---

## 🚫 범위 밖 — 지금 하지 않는다

| 안 하는 것 | 이유 |
|---|---|
| **실시간 카운트다운** ("다음 이벤트까지 02:14") | 🔴 **시간대 정의가 없다.** 서버 시간인지 현지 시간인지 repo 어디에도 없다. 틀리면 사람들이 이벤트를 **놓친다** — 정적 표시보다 나쁘다. 시간대를 정하기 전엔 금지 |
| 아이콘 3종 개별 분리 | 디자인 에셋 작업이지 개발이 아니다. PNG 한 장에 3종이 뭉쳐 있다 |
| 이벤트 관리 어드민 UI | `server_events` 모델 확정 후. 그 전엔 SQL로 넣는다 |
| 홈 i18n 키 확장 | `translations.ts` 는 키 5개뿐이고 **`transfer` 오역이 이미 미해결**이다(ko "이체" = 은행 송금). 홈이 키를 늘리면 오역이 같이 늘어난다 — resume.md 3번이 선행 |
| 개별 멤버 명단 · 랭킹 · 파워 표시 | RLS 미확인에서 **절대 금지.** 홈은 노출면이 가장 넓다 |
| JS 코드 스플리팅 | 이미지가 26MB인데 JS 503KB를 쪼개는 건 순서가 틀렸다. T-01 이후에 다시 재라 |
| 원본 사이드바 동적 폭(`--sidebar-w` JS 계산) | React 쪽은 240px 고정으로 이미 동작한다. 홈만 다르게 만들지 마라 |
| 캐러셀 자동 재생 · 스와이프 제스처 | 원본에 없다. 제약 1은 "유지"지 "확장"이 아니다 |

## ▶️ 권장 순서

`wave 1 → 2 → 3` (**P0 18h — 여기서 홈이 산다**) → `wave 4` (성능·모바일) →
`wave 5 → 6` (이벤트 데이터, **§2 결정 후**) → `wave 7` (**RLS 확인 후**)

같은 wave 안에서 `deps:없음` 끼리는 파일이 겹치지 않으면 병렬 가능.
`[Asset]` 과 `PortalCard` 는 wave 1 병렬, `RPC` 와 `PortalCarousel` 은 wave 2 병렬.

## ⛔ 착수 전 사용자 결정 2건

1. **포털 3색의 의미** — 날짜 3칸(제안) vs 이벤트 카테고리 3종. → `[Type]` 태스크를 막는다.
2. **RLS 상태 확인** (Supabase 대시보드 → Authentication → Policies). → P2 전체를 막는다.
   + `get_wing_occupancy()` RPC SQL 실행도 사용자 몫.
