# LABBY TV — Admin Dashboard

Web admin panel for **LABBY TV** (brand mark "LAB+"), an IPTV streaming app that is **live in production**. This repo holds only the dashboard; the backend and mobile app live in separate repos (below).

> Status: **built** (2026-10-25). All phases in "Build plan" are done except the hosting decision. Keep the checklist current as things change.

---

## Resources

| What | Where |
|---|---|
| Figma design (original, mobile + admin) | https://www.figma.com/design/955jlHjn6bZR9EUBCgquHf/almightyflippa — file key `955jlHjn6bZR9EUBCgquHf`. "Page 1" holds everything; "Page 2" is only a cover. |
| Figma design (dashboard only) | https://www.figma.com/design/UQlzKl97SmHWyuZIIV5dVI — file key `UQlzKl97SmHWyuZIIV5dVI`, in "Nazibullah CSE's team" (Figma account nazibullah@student.primeasia.edu.bd, Education plan). See "Dashboard Figma file" below. |
| Backend (Node/Express 5 + MongoDB) | `/Users/noyon/Documents/Backend/backend_almightyflippa` — remote `github.com/noyon-360/backend_almightyflippa` |
| Mobile app (Flutter, GetX) | `/Users/noyon/Documents/Flutter/flutter_allmightyphlippa-1` |
| Production API | `https://api.labbytv.com/api/v1` |
| Dashboard (this repo) | `/Users/noyon/Documents/Website/labbytv_dashboard` |

### Ground rules

- **Only change this repo (the dashboard).** Never edit, commit to, or run write commands in the backend or mobile app repos. Reading them to check API shapes is fine.
- **If dashboard work needs a backend (or app) change, stop and tell the user first.** Describe what should change, where, and why, and add it to "Backend additions" or "Known backend issues" below. Do not make the change yourself; the user decides and does it.
- **The backend and mobile app are in production and working.** Known backend issues are listed at the bottom for later; they are not part of the dashboard work.
- The dashboard talks to the **production API** by default. Every write (update or delete user, announcements) hits real users, so destructive actions always go through a confirm dialog.
- Never read or print `.env` files or `secret/` in the backend.

---

## Figma: admin screens (desktop, 1440 wide)

| Screen | Node ID | Notes |
|---|---|---|
| Admin Login | `158:281` | Centered card, email + password, "Forgot Password?", white pill Login button |
| Forgot Password | `158:295` | "via Email" option card with masked address, Continue |
| Verify OTP | `158:312` | 6 boxes, "Resend code in 43s" countdown, Verify |
| Update Password | `158:332` | New + repeat password with eye toggles, Continue |
| Dashboard | `158:1078` | Total User card, "Most watching" donut by genre, 5-row user list + "See all", avatar dropdown open |
| User Management | `158:1524` | Full user table, scrolls inside the card |
| Subscription | `158:699` | Plans table (name, price, description, features, active users, edit/delete) + "Create Subscription" |
| Add Subscription | `158:780` | Plan name, price, description, features as removable chips, Save |
| Personal Information | `158:857` | Read-only form + Edit button |
| Edit Personal Information | `158:946` | First/last name, country, city/state + Save (email and phone are not editable) |

Use `get_design_context` / `get_screenshot` on these node IDs when building each screen. The mobile frames (375 wide) on the same page are the user app, not this project.

**Not in Figma but needed** (design them in the same visual language): user detail (target of every "View" button), change password (linked from the avatar dropdown), announcements management, 404, and empty, loading and error states.

### Dashboard Figma file (`UQlzKl97SmHWyuZIIV5dVI`)

The Figma connection uses the account nazibullah@student.primeasia.edu.bd. An earlier copy (`mxdoA2RxdY5gRM3YJE843W`, in the old Starter team) is abandoned; ignore it.

**Pages:** `Screens` (`0:1`) and `Design System` (`1:2`).

**Design System page:**
- Variables, collection `Color`: `bg/*`, `text/*`, `border/*`, `action/*`, `status/*` and `chart/1-7`. Web code syntax `var(--color-…)`. `status/success` is `#22C55E`, brighter than the mobile app's green, so it stays readable on dark backgrounds.
- Variables, collection `Dimension`: `space/4-40` and `radius/sm|md|lg|xl|full` (4, 6, 8, 12, 82).
- 13 Manrope text styles, plus the Shadow/Soft and Shadow/Modal effect styles.
- Icons (section `2:2`): 30 Lucide icons as `icon/<name>` components.
- Button `4:19` (Primary, Secondary, Danger, Ghost) · Nav Item `4:28` · Input `4:49` (Default, Focus, Error, Disabled; optional helper and trailing icon) · Badge `4:68` (6 tones) · View Button `4:69`.
- Top Bar `5:9` (real LAB+ logo) · Sidebar `5:20` · Stat Card `5:52` · Page Header `5:64`.

**Layout change from the original:** the Sidebar is **238 wide** (nav items 214) so "Announcements" fits on one line. Content starts at **x=268** and is **1142 wide**, with the top at y=124. (The React app has since been made more compact; see "Sizing" below.)

**Screens page:**
- Section `8:2`, "Original admin screens (paste here)": the user pastes the 10 original admin frames here.
- Section `8:3`, "New screens":
  - User Detail `8:4`
  - Edit Plan modal `8:172`
  - Delete User modal `8:289`
  - Change Password `10:211`
  - Announcements `10:291`
  - Create Announcement `10:460`
  - Subscription Overview `11:421`
  - States `11:605` (empty, no results, error, loading, toasts, 404, not admin, session expired)

**Figma gotchas found while building:**
- A fill bound to a variable loses its paint opacity in **instances**. After creating a Badge instance, set `fills[0].opacity` on it again. For tints inside components, use unbound paints.
- Setting `layoutMode` after `resize()` makes the frame shrink to fit its content. Set both axis sizing modes to `FIXED` for circles and icon badges.
- You can't append children inside an instance. Build dropdown fields as plain frames, or use the Input's trailing-icon property.

### Theme: mobile app colors (decided 2026-10-25)

The dashboard uses the **mobile app's palette** (`lib/core/constants/app_colors.dart` in the Flutter repo). This replaced the earlier orange-accent dark theme. It is dark everywhere, and the single accent is **red `#E50202`**, the same red the app uses for buttons, spinners and focus borders. Tokens live in `src/app/globals.css`:

| Token | Value | Mobile source / use |
|---|---|---|
| `chrome`, `canvas` | `#000000` | `primaryBlack`. Top bar, sidebar (1px `line` divider) and content |
| `surface`, `nav-active` | `#272727` | `containerBgColor`. Cards, stat cards, active nav pill |
| `table`, `field` | `#1A1A1A` | Tables and input fill |
| `brand` | `#E50202` | `red`. Primary buttons, focus borders, active nav icon, toggle track |
| `on-brand` | `#FFFFFF` | Text on red (about 4.8:1) |
| `brand-fg` | `#FF4D4D` | Red **small text** on dark (plain `#E50202` is about 3:1 on `#272727`) |
| `muted`, `line-strong` | `#BFBFBF` | `primaryGray`. Secondary text, hint text |
| `line` | `#545454` | `iconBgColor`. Dividers |
| `success` | `#039B06` | `successGreen`. Fills and tints |
| `success-fg` | `#22B525` | Green small text (plain `#039B06` is about 4:1 on `#272727`) |
| `danger` | `#E50202` | Same red as `brand`; destructive buttons are only shown in confirm dialogs next to Cancel |

White is only for text and icons, plus text on red buttons. The dashboard Figma file still shows the orange accent; for color, the tokens above win over Figma.

### Layout shell (shared by every logged-in page)

- **Top bar:** dark (`bg/chrome`), 64px tall. Logo on the left; admin name, "Admin" role label, avatar and chevron on the right. The dropdown has the name and email header, then Personal Information, Change Password and Sign Out.
- **Sidebar:** dark (`chrome`), 220px wide in the app (238 in the dashboard file, 204 in the original). Dashboard, User Management, Subscription, Announcements and Setting, with Logout pinned to the bottom. The active item is a `#272727` pill with white text and a red icon.
- **Content:** black `#000000` background. Page title is 24px SemiBold, with a 13px breadcrumb under it on inner pages.

### Sizing (decided 2026-10-26)

The Figma sizes (48px titles, 58px inputs, 20px nav text) read as too big in the browser, so the app uses a compact admin scale instead. `globals.css` redefines the Tailwind type scale one step down (`text-base` 14px, `text-sm` 13px, `text-lg` 16px, `text-xl` 18px, `text-2xl` 20px). Inputs and `md` buttons are 40px tall (`sm` buttons 32px), the top bar is 64px, the sidebar is 220px wide, and table cells use `px-4 py-3`. Prefer these over the Figma pixel values.

### Design tokens (from Figma variables)

| Token | Value | Use |
|---|---|---|
| Black/Normal | `#111111` | Content background, auth page background |
| Black/Dark | `#0D0D0D` | |
| Grey/Darker | `#272727` | Cards, form panels, dark tables |
| Background | `#1F2022` | Input fill (Add Subscription) |
| Grey/Dark | `#545454` | |
| Grey/Normal | `#707070` | |
| White/Darker | `#595959` | |
| White/Dark | `#BFBFBF` | Input borders, secondary text |
| Grey/Light | `#D3D3D3` | |
| Black/Light | `#E7E7E7` | Table row dividers on light tables |
| White/Normal | `#FFFFFF` | Text on dark, top bar, sidebar, primary buttons |
| Blue/Normal hover | `#9EC7DC` | "View" buttons in user tables |
| Red/Normal | `#E50202` | Destructive actions and errors only |
| Soft Shadow | `0 4px 30px #2E2D740D` | Cards on the light areas |

Light user tables use a pale cyan fill (about `#EEFBFC`); confirm the exact value from the node when building.

**Type:** Figma mixes Manrope, Poppins and Outfit (Outfit only in the user tables). **Use Manrope everywhere**; it is the brand font and the mobile app uses it. Scale: H3 48/600, H6 32/600, 24/500, 20/500-600, 18/500, 16/400-500, 12/400; line height 1.2 (1.5 for paragraphs).

**Charts:** genre donut colors in Figma are Comedy dark green, Action `#FF5733`-ish orange-red, Einrichtungen maroon, Mystery blue, Slice of Life navy, Romance green, Drama yellow. Load the `dataviz` skill before building any chart.

---

## Backend API (what the dashboard uses)

Base URL: `https://api.labbytv.com/api/v1`. Auth header: `Authorization: Bearer <accessToken>`.

**Response shape** (most endpoints): `{ success, message, data }`. Errors: `{ success: false, message, errorSources }` with a matching HTTP status. Exception: `/watch-history/*` returns `{ status, message, data }`.

### Auth

| Call | Body | Returns / notes |
|---|---|---|
| `POST /auth/login` | `{ email, password }` | `data: { accessToken, refreshToken, role, _id, user }`. **The dashboard must reject `role !== "admin"`.** Do not send `deviceId`; that is for the single-device rule on mobile. |
| `POST /auth/refresh-token` | `{ refreshToken }` | `data: { accessToken, refreshToken }`. The refresh token rotates every time, so store the new one. |
| `POST /auth/logout` | — (auth) | Clears the refresh token server-side |
| `POST /auth/forget` | `{ email }` | Emails a 6-digit code |
| `POST /auth/reset-password` | `{ email, otp, password }` | `otp` must be a **string** (strict compare). |
| `POST /auth/change-password` | `{ oldPassword, newPassword }` (auth) | |

**Do not call `POST /auth/verify`**: it checks fields that are never set and always fails. The Verify OTP screen only collects the code and holds it in state; the actual check happens at `/auth/reset-password`. If the code is wrong, go back to the OTP step with the error message.

The Figma Forgot Password screen shows the email already masked, so add an email field (prefilled from the login form) before it.

### Admin users

| Call | Notes |
|---|---|
| `GET /admin/users` | **All** users, no paging, search or sort. Page, search and filter on the client. |
| `GET /admin/user/:id` | One user |
| `PUT /admin/user/:id` | Writes `req.body` straight to the document with no whitelist. **Only ever send an explicit allowlist of fields** (for example `name`, `plan`, `subscriptionStatus`). **Never send `password`**: it would be saved unhashed. |
| `DELETE /admin/user/:id` | Hard delete. It does **not** remove the user's playlists, history or avatar (unlike the user's own delete-account). Confirm dialog required. |

User fields useful to the dashboard: `_id, name, email, phone, country, city, avatar.url, role ("user" or "admin"), plan ("free", "basic" or "premium"), subscriptionStatus ("none", "active", "canceled", "past_due" or "trialing"), subscriptionPlatform ("none", "apple" or "google"), subscriptionProductId, subscriptionStartDate, subscriptionExpiresAt, createdAt, updatedAt, fcmTokens[].platform`.

### Admin's own profile

| Call | Notes |
|---|---|
| `GET /user/profile` | Current admin |
| `PUT /user/profile` | multipart: `name`, `country`, `city`, `avatar` (file, max 10MB, JPEG/PNG/WEBP/HEIC). There is a single `name` field, so the Figma first/last name fields are split for display and joined into `name` on save. Phone and email cannot be changed via the API, which matches the Figma edit screen. |

### Announcements (admin API ready, no Figma screen)

`GET/POST /announcement/admin`, `PUT/DELETE /announcement/admin/:id`. Fields: `title` (max 120), `message` (max 1000), `type` (update, feature, maintenance, important or info), `actionLabel` (max 40), `actionUrl` (http(s) only), `priority` (number, higher shows first), `isActive`, `startsAt`, `endsAt`. The app shows up to 5 active announcements on Home, highest priority first.

### Not available from the API (affects the plan)

- **Stats:** there's no stats endpoint. Totals and growth must be computed client-side from `/admin/users`.
- **Most watched by genre:** not possible. Watch history stores no genre or category, and there's no admin access to watch history.
- **Subscription plans:** there's no plan model. Plans are store products in RevenueCat, App Store and Play Store, so the Figma create/edit/delete with price and features has nothing to save to.
- **Other users' subscription history or watch history:** no admin endpoints.

---

## Tech stack

The repo was scaffolded with Create Next App, so the dashboard is built on **Next.js 16** (App Router, Turbopack) instead of the Vite setup first planned. All data fetching is client-side; pages are thin server files that set `metadata` and render a client component from `src/features/`.

| Concern | Choice |
|---|---|
| Build | Next.js 16 + React 19 + TypeScript (strict). `cacheComponents` and `partialPrefetching` are on. |
| Styling | Tailwind CSS v4. Tokens live in `@theme` in `src/app/globals.css` (`bg-surface`, `bg-brand`, `text-muted`, `border-line`, …). |
| Routing | Next App Router: `src/app/(auth)/*` (logged out) and `src/app/(app)/*` (behind `RequireAdmin` + `AppShell`). `/` redirects to `/dashboard` in `next.config.ts`. |
| Server state | TanStack Query (caching, refetch, mutations) |
| HTTP | axios, one instance with interceptors for the bearer token and refresh-on-401 |
| Forms | react-hook-form + zod |
| Charts | Recharts |
| Icons | lucide-react (matches the Figma outline icons) |
| Font | Manrope via Google Fonts |

Config: `NEXT_PUBLIC_API_BASE_URL` (defaults to production). Keep a `.env.example`; never commit `.env`. Commands: `npm run dev`, `npm run build`, `npx eslint src`.

**Token storage:** the access token is in memory and the refresh token is in `localStorage`, so a reload restores the session through `/auth/refresh-token`. On a refresh failure, everything is cleared and the user goes to `/login?expired=1`. Refreshes are single-flight and serialized across tabs with a Web Lock (`src/api/client.ts`), because the backend keeps one refresh token per user and rotates it on every call.

**Next.js gotchas in this repo:**
- Read `node_modules/next/dist/docs/` before using a Next API (see AGENTS.md); this version differs from older docs.
- With `cacheComponents`, Next keeps up to 3 visited routes **mounted but hidden** (React `<Activity>`). Page state survives navigation, and hidden pages stay in the DOM. Transient UI must reset itself: `Modal` and `ProfileMenu` close in a `useLayoutEffect` cleanup, forms call `reset()` after saving, and errors passed between steps live in shared state (`ResetFlow`), not in local initial state. Browser tests must target visible elements only (Playwright `>> visible=true`).
- Client components that use `useSearchParams` or `useParams` are wrapped in `<Suspense>` in their `page.tsx`.
- Every page waits for the browser-side session check, so Next's "instant navigation" check would flag each page as "dropped from rendering". `next.config.ts` sets `experimental.instantInsights.validationLevel: "manual-warning"` so only pages with an explicit `export const instant` are checked. `instant = false` on a layout does **not** cover its pages.
- `allowedDevOrigins: ["192.168.*.*"]` lets the dev server be opened from the local network; without it Next blocks its dev scripts and the page never hydrates.
- `react-hooks` lint rules from the React Compiler are on: no `Date.now()` in render, no `setState` directly inside effects, no refs read in render.

### Folder layout

```
src/
  app/          routes only: (auth)/login|forgot-password|verify-otp|reset-password,
                (app)/dashboard|users|users/[id]|subscription|announcements|announcements/new|
                announcements/[id]/edit|settings|settings/edit|settings/password, not-found
  api/          axios client (refresh, errors), auth, users, profile, announcements (TanStack Query hooks)
  auth/         session (token store), AuthProvider/useAuth, RequireAdmin
  components/   ui/ (Button, Field, Badge, Card, Table, Modal, Toast, States, FilterTabs, Pagination,
                StatCard, Switch, Avatar), charts/DonutChart
  layout/       AppShell (top bar + mobile drawer), Sidebar, ProfileMenu, PageHeader, nav
  features/     auth, dashboard, users, subscriptions, announcements, settings (one page component each)
  lib/          format (dates, labels, names), stats (computed from /admin/users), passwords, env
  types/        API types (User, Announcement, ApiResponse<T>)
```

---

## Build plan

### Phase 0: Foundation
- [x] Scaffold (Next.js 16 + TS + Tailwind v4, see Tech stack) and add the dependencies above
- [x] Tailwind theme from the Figma tokens; Manrope; base styles
- [x] axios client: bearer header, single-flight refresh on 401, normalized errors (`message` from the response)
- [x] `ApiResponse<T>` and `User` types
- [x] UI primitives: Button (red pill, outline, danger, ghost), Input (dark, `#707070` border, red focus, password eye), Card, Table, Modal/ConfirmDialog, Toast, Skeleton, EmptyState
- [x] AppShell: Topbar + Sidebar + content area, active nav state, profile dropdown

### Phase 1: Auth (Figma `158:281`, `158:295`, `158:312`, `158:332`)
- [x] Login: call `/auth/login`. If the user isn't an admin, show "This account doesn't have admin access" and don't keep the tokens.
- [x] Forgot Password: email step, then call `/auth/forget`
- [x] Verify OTP: 6 boxes with paste support and a 60s resend countdown (resend calls `/auth/forget` again)
- [x] Update Password: new + repeat (must match, min length), then call `/auth/reset-password` with `{email, otp, password}`, then return to login with a success notice
- [x] `RequireAdmin` guard, session restore on reload, Sign Out (calls `/auth/logout`, then clears state)

### Phase 2: User Management (`158:1524`)
- [x] Table with Name, Mail, Added date, Plan and View. Use client-side search (name/email), plan filter, sort by date and pagination (25 per page).
- [x] User detail page (new design): profile, plan and subscription fields (status, platform, product, start/expiry), devices (count and platform of `fcmTokens`), joined date
- [x] Actions on detail: change plan/status (allowlisted `PUT` fields only) and delete (typed confirmation)

### Phase 3: Dashboard (`158:1078`)
- [x] Total User card: total count. The delta compares sign-ups in the last 30 days against the 30 days before.
- [x] Extra stat cards computed from users: Premium users, Active subscriptions, iOS vs Android (from `subscriptionPlatform`)
- [x] User list: latest 5 by `createdAt`, "See all" links to User Management
- [x] **"Most watching" donut:** genre data doesn't exist. Until the backend supports it, use the same donut for **users by plan** (free, basic, premium) or **subscriptions by platform**, and keep the component reusable so it can switch to genre data later.

### Phase 4: Settings (`158:857`, `158:946`)
- [x] Personal Information, read-only, from `/user/profile`: avatar, Name and Email only (decided 2026-10-26: an admin doesn't need last name, phone, country or city, so the Figma fields were dropped)
- [x] Edit: a single Name field, plus avatar upload (Email shown read-only)
- [x] Change Password page (new design, same form style), using `/auth/change-password`

### Phase 5: Announcements (new design)
- [x] List with type badge, active toggle, priority and visibility window
- [x] Create/edit form with the field limits above and an http(s) check on `actionUrl`; delete with confirm
- [x] Add "Announcements" to the sidebar

### Phase 6: Subscription (`158:699`, `158:780`)
**Decided: option 1 (built).** The backend has no plans to manage. Options considered:
1. **Read-only overview (recommended for now):** show the store products in use (distinct `subscriptionProductId`) with active user counts per product and platform, computed from `/admin/users`. Keep the Figma table look and drop create/edit/delete.
2. **Full plan CRUD as designed:** needs a new backend Plan model and endpoints, and RevenueCat/store prices would still be the real source of truth.

### Phase 7: Polish and ship
- [x] Loading skeletons, empty and error states on every page; 404 page
- [x] Responsive down to tablet; on mobile the sidebar collapses to a drawer
- [ ] Hosting decision (Vercel/Netlify, or the same VPS as the API). Confirm production CORS allows the dashboard origin.

---

## Backend additions that would unlock Figma features

These need explicit approval before anyone touches the backend.

| Need | Change |
|---|---|
| Real dashboard stats without loading every user | `GET /admin/stats` (totals, growth, plan and platform breakdown) |
| Scalable user table | Paging, search and sort query params on `GET /admin/users` |
| "Most watching" by genre | Store `categoryId`/genre in watch history, plus an aggregation endpoint |
| Admin view of a user's activity | `GET /admin/user/:id/history`, `GET /admin/user/:id/subscriptions` |
| Subscription plan CRUD as designed | Plan model + `/admin/plans` CRUD |

---

## Known backend issues (deferred; the user will fix these later)

Logged so they aren't forgotten. **Not** in scope for the dashboard.

1. `route/admin.route.js` uses `protect` but not `isAdmin`, so any logged-in user can call the admin endpoints. `updateUser` also accepts any field.
2. The Apple webhook decodes JWS payloads without verifying the signature.
3. Apple purchase verification falls back to the sandbox in production.
4. `/server`, `/category` and `/search` have no auth and fetch any `serverUrl` the caller sends.
5. The RevenueCat webhook skips its auth check if `REVENUECAT_WEBHOOK_SECRET` is unset.
6. The global error handler returns the raw `err` object, which can include IPTV credentials in axios errors.
7. Smaller items:
   - `/auth/verify` is broken
   - `watchHistory.updateVideoStatus` passes the `AppError` arguments in the wrong order
   - the code generator never produces the digit 9
   - a missing token returns 404
   - login reveals whether an email exists
8. Unused code: Stripe and Braintree services, the `uploadPlaylist` route, leftover fields from another project (`shopLogo`, `*Alerts`, `isDriver`), Socket.io rooms with no emits, and the `Notification` collection, which has no read endpoint.

Found while building the dashboard (2026-10-25). The dashboard works around each one; nothing was changed in the backend:

9. `POST /auth/login` returns the full user document as `data.user`, **including the bcrypt password hash and the refresh token** (`isUserExistsByEmail` selects `+password`). The dashboard ignores `data.user` and loads `/user/profile` instead. Fix: send a sanitized user (or only `_id`, `role`).
10. `PUT /admin/user/:id` returns the updated document without the `-refreshToken` select, so the response includes the user's refresh token. The dashboard doesn't use the response.
11. One refresh token per user (`user.refreshToken`). An admin who signs in to the dashboard invalidates their own mobile app refresh token and vice versa. If a non-admin tries the dashboard, their mobile session's refresh token is also rotated. The dashboard serializes refreshes across tabs to cope. Fix: a refresh token per session or device.
12. `PUT /user/profile` ignores empty strings (`if (updates.country)`), so country and city can be changed but never cleared.
13. Admin check is only on the client for `/admin/*` (see item 1). Until `isAdmin` is added there, the dashboard's role check is UX, not security.

Mobile app theme notes (also deferred): Manrope isn't registered in `pubspec.yaml`, so it falls back to the system font; the scaffold uses `#000000` vs Figma's `#111111`; colors and text styles are mostly inline rather than coming from the theme.
