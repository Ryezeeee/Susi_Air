# Susi Air Pilot App — Fullstack Technical Test

A small slice of the Susi Air Pilot App: sign in, a home screen with duty-limit tracking and document expiry, and a monthly duty calendar.

| Folder | Stack | Deploy target |
|---|---|---|
| [`/nest`](./nest) | NestJS 10 · TypeScript · class-validator · JWT | Render / Railway |
| [`/nuxt`](./nuxt) | Nuxt 3 · `<script setup>` · Pinia · SCSS · TypeScript | Vercel / Netlify |

**Live URLs**
- Frontend: `<add after deploying>`
- API: `<add after deploying>`

Demo account: `johndoe` / `susiairtest`

---

## Running locally

Requirements: Node 18+ (tested on Node 22).

### 1. API

```bash
cd nest
cp .env.example .env      # optional, every value has a default
npm install
npm run start:dev         # http://localhost:3001
npm test                  # rolling-sum unit tests
```

Production: `npm run build && npm start`.

### 2. Frontend

```bash
cd nuxt
cp .env.example .env      # points at http://localhost:3001 by default
npm install
npm run dev               # http://localhost:3000
```

Production: `npm run build` then `node .output/server/index.mjs`, or `npm run generate` for a static build.

### Environment variables

**`/nest`**

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3001` | HTTP port (Render/Railway set this themselves) |
| `JWT_SECRET` | dev-only value | Secret used to sign login tokens. **Set this in production.** |
| `JWT_EXPIRES_IN` | `12h` | Token lifetime |
| `APP_TODAY` | `2026-05-15` | The app's "today". Every date calculation uses this, never `new Date()` |
| `CORS_ORIGIN` | `*` | Comma-separated allowed origins, e.g. your Vercel URL |
| `PILOT_USERNAME` / `PILOT_PASSWORD` | `johndoe` / `susiairtest` | The hardcoded pilot account |
| `DATA_DIR` | `./data` | Folder holding the three mock JSON files |

**`/nuxt`**

| Variable | Default | Purpose |
|---|---|---|
| `NUXT_PUBLIC_API_BASE` | `http://localhost:3001` | Base URL of the API, no trailing slash |
| `NUXT_PUBLIC_APP_TODAY` | `2026-05-15` | Only picks the calendar's opening month. All date logic is in the API |

---

## API

All endpoints except `POST /auth/login` (and `GET /health`, for the host's liveness check) require `Authorization: Bearer <token>`.

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/login` | `{ username, password }` → `{ accessToken, tokenType, expiresIn }` |
| GET | `/pilot/me` | Name, total flight hours, avatar URL |
| GET | `/flight-hours?from=YYYY-MM-DD&to=YYYY-MM-DD` | Daily hours; every date in the range is returned, gaps as `0` with `hasData: false`. Max 400 days |
| GET | `/flight-hours/summary?range=1w\|1m\|3m\|6m\|1y` | 15-point rolling-sum series (today ±7 days), limit, Y max, and the four limit cards |
| GET | `/documents` | Documents with `daysRemaining` and `status: expired \| soon \| safe` |
| GET | `/schedules?year=YYYY&month=MM` | One month of entries plus the legend. Empty month → empty list, not 404 |

**Error shape** (one global exception filter, used for every error):

```json
{
  "statusCode": 401,
  "error": "INVALID_CREDENTIALS",
  "message": "Incorrect username or password.",
  "details": ["only present for validation errors"],
  "path": "/auth/login",
  "timestamp": "2026-10-09T04:19:08.945Z"
}
```

`error` is a stable machine code (`VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `TOKEN_MISSING`, `TOKEN_INVALID`, `INVALID_RANGE`, `RANGE_TOO_LARGE`…), so the frontend branches on the code and never on message text.

---

## Main choices and why

### Backend

- **Module per feature**, each with its own controller, service and DTOs (`auth`, `pilot`, `flight-hours`, `documents`, `schedules`). A global `DataModule` loads the three JSON files once at boot (`OnModuleInit`) and keeps them in memory; no database, as the brief allows.
- **Auth guard registered globally** (`APP_GUARD`) so every route is protected by default and `/auth/login` opts out with `@Public()`. Forgetting the decorator fails closed, not open. Tokens are signed JWTs, so the guard checks exactly what `/auth/login` issued. Credentials are compared in constant time.
- **Validation** via a global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`, `stopAtFirstError`). Query params are typed DTOs (`year`/`month` become numbers; dates must be real `YYYY-MM-DD` dates, so `2026-02-30` is rejected). Cross-field rules (`from <= to`, max span) live in the service.
- **One clock.** `ClockService` reads `APP_TODAY` (default 15 May 2026). Every service asks it for "today", so the reviewer sees the same numbers whenever they look.

### Rolling sum (`FlightHoursService.computeRollingSum`)

The daily data becomes a dense, gap-free array (missing dates → 0) and a **prefix-sum** array at boot. Any window is then `prefix[end] − prefix[start]`: O(1) per point whatever the window size, so a 365-day window costs the same as a 7-day one.

Decisions on the cases the brief flags:

| Case | Decision |
|---|---|
| Zero-hour or missing days | Count as 0; never skipped. A 7-day window is always 7 calendar days, not "the last 7 entries" (covered by a unit test) |
| Window reaches before the first logged day (27 Dec 2024) | Missing days count as 0 and the point is flagged `isPartialWindow: true`, so the UI can say the figure may be understated rather than inventing data |
| Future dates in the display range | The dataset has entries after "today" (16–31 May). I treat those as **planned** hours: a future point is "where your rolling window will stand if you fly the roster", flagged `isProjected: true` and drawn dashed. That is the useful question for a pilot (will I bust a limit next week?). Beyond the end of the data, days add 0 |
| Limit cards | Use **flown** hours only, up to and including today. Daily = today, weekly/monthly/annual = rolling 7/30/365 days |
| Values above the red line | With this data the 1w projection reaches 44.7 h (18–21 May) and 1m tops 100 h on 8 and 21 May. Points are flagged `overLimit`; the chart extends its Y axis if a value ever exceeds the configured max, so nothing is clipped |

Card status: `ok` below 80 % of the limit, `warning` from 80 %, `over` above 100 %. Computed on the server and returned with the card.

### Documents

Status follows the rule in `mock-documents.json` (≤ 0 days expired, ≤ 30 days soon, otherwise safe), computed on the server and sorted most-urgent first.
**Note:** that file has its own `"today": "2026-05-31"`, while the brief says to treat today as 15 May 2026. I use the single app-wide `APP_TODAY` so the home screen never shows two different "todays". Set `APP_TODAY=2026-05-31` to see the alternative.

### Frontend

- **SPA (`ssr: false`).** The app sits entirely behind a login, has no SEO need, and pilots open it on phones. SPA mode keeps the token client-side and deploys as static files anywhere. With more time I'd revisit SSR plus an httpOnly cookie (see below).
- **Pinia stores per domain** (`auth`, `pilot`, `flightHours`, `documents`, `schedule`). The flight-hours store caches each range, so flipping the toggle back is instant. The schedule store refetches on every month change, as the brief asks, and ignores stale responses if the user taps quickly.
- **No mock data in the frontend.** Everything comes from the API; the only local config is the API URL and the calendar's opening month.
- **Chart hand-built in SVG** instead of a chart library: the spec (centred today, red limit line, per-range Y max, projected segment, over-limit markers) is small and specific, and a library would cost more bundle and fighting than it saves. Tap any day to see its value; days are keyboard-focusable.
- **Calendar** colours each day with `base_color` from the API, picks white or navy text by contrast, shows a tick when `count_logbooks === count_schedules`, otherwise the remaining count. Today is outlined; tapping a day opens the "Detail page coming soon" placeholder.
- **Design:** brief palette as SCSS tokens, Plus Jakarta Sans, 14 px card radius, pill buttons, Lucide line icons, navy header to match Susi Air's look. Phone-width column on desktop.
- **Session handling:** any 401 from a protected call signs the user out and returns them to the sign-in page with a "session expired" message. Bad credentials show a clear inline error.

### Data quirks noticed

- The legend's codes (`DTY`, `RLV`, `TRX`, `ULV`…) differ from the brief's list (`DUTY`, `RL`, `TX`, `UL`…). I use the codes from the data.
- Entry `97041` (4 Jun) is `TRX` but has colour `#FBA577`, which the legend assigns to `TRD`. As the brief says to colour by `base_color`, it renders peach; flagging it in case the data is wrong.
- Entry `97027` (15 May) is `status: 1` (pending) with all duties logged; it shows a tick, since the tick rule is defined by the counts.

---

## Deploying

**API on Render:** "New → Blueprint" with this repo (uses [`render.yaml`](./render.yaml)), or a Web Service with root `nest`, build `npm install && npm run build`, start `npm start`. Set `JWT_SECRET` and `CORS_ORIGIN=<your Vercel URL>`. Railway works the same with root directory `nest`.

**Frontend on Vercel:** import the repo, set Root Directory to `nuxt` (Nuxt is auto-detected), and add `NUXT_PUBLIC_API_BASE=<your API URL>`. Netlify: base directory `nuxt`, build `npm run generate`, publish `nuxt/.output/public`.

Free Render instances sleep when idle; the first request after a pause can take ~30 s.

---

## With more time

- Move the token to an **httpOnly cookie** set by the API, so script on the page can never read it, and add refresh tokens.
- **E2E tests** (Playwright) for sign-in, range toggle and month navigation, plus controller tests with Supertest. Only the rolling-sum core is unit-tested now.
- **OpenAPI docs** via `@nestjs/swagger`, and share the DTO types with the frontend instead of mirroring them in `nuxt/types/api.ts`.
- A real persistence layer (SQLite/Postgres) once logbook entries can be written, and roster-vs-actual separation in the data model instead of inferring "planned" from the date.
- Rate-limit `/auth/login`, structured request logging, and a health check that verifies the data loaded.
- Offline support (PWA) — pilots are often at remote strips with poor signal.
