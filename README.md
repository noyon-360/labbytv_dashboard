# LABBY TV Admin Dashboard

Web admin panel for LABBY TV (LAB+). Next.js 16, React 19, Tailwind v4, TanStack Query.

```bash
npm install
cp .env.example .env.local   # optional; defaults to the production API
npm run dev                  # http://localhost:3000
npm run build && npm start
npx eslint src
```

Sign in with an account whose `role` is `admin`. The dashboard talks to the **production API** by default (`NEXT_PUBLIC_API_BASE_URL`), so edits and deletes affect real users.

Project notes, API details, design tokens and the list of backend changes the dashboard would benefit from are in [.claude/CLAUDE.md](.claude/CLAUDE.md).
