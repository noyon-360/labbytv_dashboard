# LABBY TV — Admin Dashboard

Web admin panel for **LABBY TV** (brand mark "LAB+"), an IPTV streaming app that is **live in production**. This repo holds only the dashboard; the backend and mobile app live in separate repos (below).

> Status: planning. Nothing is scaffolded yet. Update the checklist in "Build plan" as phases complete.

---

## Resources

| What | Where |
|---|---|
| Figma design | https://www.figma.com/design/955jlHjn6bZR9EUBCgquHf/almightyflippa — file key `955jlHjn6bZR9EUBCgquHf`. "Page 1" holds everything; "Page 2" is only a cover. |
| Backend (Node/Express 5 + MongoDB) | `/Users/noyon/Documents/Backend/backend_almightyflippa` — remote `github.com/noyon-360/backend_almightyflippa` |
| Mobile app (Flutter, GetX) | `/Users/noyon/Documents/Flutter/flutter_allmightyphlippa-1` |
| Production API | `https://api.labbytv.com/api/v1` |
| Dashboard (this repo) | `/Users/noyon/Documents/Website/labbytv_dashboard` |

### Ground rules

- **The backend and mobile app are in production and working.** Do not edit either repo unless the user explicitly asks for that specific change. Known backend issues are listed at the bottom for later; they are not part of the dashboard work.
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

### Layout shell (shared by every logged-in page)

- **Top bar:** white, about 80px tall. Logo on the left; admin name, "Admin" role label, avatar and chevron on the right. The dropdown has the name and email header, then Personal Information, Change Password and Sign Out.
- **Sidebar:** white, about 200px wide. Dashboard, User Management, Subscription and Setting, with Logout pinned to the bottom. The active item is a black pill with white text.
- **Content:** dark `#111111` background. Page title is H3 (48px, SemiBold), with a breadcrumb under it on inner pages.

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

| Concern | Choice |
|---|---|
| Build | Vite + React 18 + TypeScript (strict) |
| Styling | Tailwind CSS, with the Figma tokens above in `tailwind.config` |
| Routing | React Router |
| Server state | TanStack Query (caching, refetch, mutations) |
| HTTP | axios, one instance with interceptors for the bearer token and refresh-on-401 |
| Forms | react-hook-form + zod |
| Charts | Recharts |
| Icons | lucide-react (matches the Figma outline icons) |
| Font | Manrope via Google Fonts |

Config: `VITE_API_BASE_URL` (defaults to production). Keep a `.env.example`; never commit `.env`.

**Token storage:** keep the access token in memory and the refresh token in `localStorage`, so a reload can restore the session through `/auth/refresh-token`. On a refresh failure, clear everything and go to `/login`.

### Folder layout

```
src/
  api/          axios client, interceptors, one file per resource (auth, users, profile, announcements)
  auth/         AuthProvider, useAuth, RequireAdmin route guard
  components/   ui primitives (Button, Input, Card, Table, Modal, ConfirmDialog, Toast, Skeleton)
  layout/       AppShell, Sidebar, Topbar, ProfileMenu, Breadcrumb
  features/
    auth/       Login, ForgotPassword, VerifyOtp, UpdatePassword
    dashboard/
    users/      UserList, UserDetail
    subscriptions/
    announcements/
    settings/   PersonalInfo, EditPersonalInfo, ChangePassword
  lib/          formatters (dates, plan labels), stats helpers
  types/        API types (User, Announcement, ApiResponse<T>)
```

---

## Build plan

### Phase 0: Foundation
- [ ] Scaffold Vite + React + TS + Tailwind and add the dependencies above
- [ ] Tailwind theme from the Figma tokens; Manrope; base styles
- [ ] axios client: bearer header, single-flight refresh on 401, normalized errors (`message` from the response)
- [ ] `ApiResponse<T>` and `User` types
- [ ] UI primitives: Button (white pill, outline, danger), Input (dark, `#BFBFBF` border, password eye), Card, Table, Modal/ConfirmDialog, Toast, Skeleton, EmptyState
- [ ] AppShell: Topbar + Sidebar + content area, active nav state, profile dropdown

### Phase 1: Auth (Figma `158:281`, `158:295`, `158:312`, `158:332`)
- [ ] Login: call `/auth/login`. If the user isn't an admin, show "This account doesn't have admin access" and don't keep the tokens.
- [ ] Forgot Password: email step, then call `/auth/forget`
- [ ] Verify OTP: 6 boxes with paste support and a 60s resend countdown (resend calls `/auth/forget` again)
- [ ] Update Password: new + repeat (must match, min length), then call `/auth/reset-password` with `{email, otp, password}`, then return to login with a success toast
- [ ] `RequireAdmin` guard, session restore on reload, Sign Out (calls `/auth/logout`, then clears state)

### Phase 2: User Management (`158:1524`)
- [ ] Table with Name, Mail, Added date, Plan and View. Use client-side search (name/email), plan filter, sort by date and pagination (25 per page).
- [ ] User detail page (new design): profile, plan and subscription fields (status, platform, product, start/expiry), devices (count and platform of `fcmTokens`), joined date
- [ ] Actions on detail: change plan/status (allowlisted `PUT` fields only) and delete (typed confirmation)

### Phase 3: Dashboard (`158:1078`)
- [ ] Total User card: total count. The delta compares sign-ups in the last 30 days against the 30 days before.
- [ ] Extra stat cards computed from users: Premium users, Active subscriptions, iOS vs Android (from `subscriptionPlatform`)
- [ ] User list: latest 5 by `createdAt`, "See all" links to User Management
- [ ] **"Most watching" donut:** genre data doesn't exist. Until the backend supports it, use the same donut for **users by plan** (free, basic, premium) or **subscriptions by platform**, and keep the component reusable so it can switch to genre data later.

### Phase 4: Settings (`158:857`, `158:946`)
- [ ] Personal Information, read-only, from `/user/profile`
- [ ] Edit: first/last name joined into `name`, country, city, avatar upload
- [ ] Change Password page (new design, same form style), using `/auth/change-password`

### Phase 5: Announcements (new design)
- [ ] List with type badge, active toggle, priority and visibility window
- [ ] Create/edit form with the field limits above and an http(s) check on `actionUrl`; delete with confirm
- [ ] Add "Announcements" to the sidebar

### Phase 6: Subscription (`158:699`, `158:780`)
**Needs a decision.** The backend has no plans to manage. Options:
1. **Read-only overview (recommended for now):** show the store products in use (distinct `subscriptionProductId`) with active user counts per product and platform, computed from `/admin/users`. Keep the Figma table look and drop create/edit/delete.
2. **Full plan CRUD as designed:** needs a new backend Plan model and endpoints, and RevenueCat/store prices would still be the real source of truth.

### Phase 7: Polish and ship
- [ ] Loading skeletons, empty and error states on every page; 404 page
- [ ] Responsive down to tablet; on mobile the sidebar collapses to a drawer
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

Mobile app theme notes (also deferred): Manrope isn't registered in `pubspec.yaml`, so it falls back to the system font; the scaffold uses `#000000` vs Figma's `#111111`; colors and text styles are mostly inline rather than coming from the theme.
