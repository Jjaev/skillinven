# Skillinven

Korean-first skills marketplace MVP built with Next.js 15, Tailwind, and Supabase.

## Commands

```bash
npm install
npm run lint
npm run build
npm run dev
npm run import:skills
```

## Environment

```bash
GITHUB_TOKEN=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Without Supabase env vars, the app falls back to a local seed dataset for homepage and detail rendering.

## Supabase setup

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](</Users/joe/Desktop/claude space/mac_uk_work/01_Projects/Pjt_진행중_Skills 마켓 만들기/supabase/schema.sql>) in the SQL editor.
3. Copy `.env.example` to `.env.local` and fill the four env vars.
4. Run `npm run import:skills` to upsert the initial dataset.

## Notes

- Public routes use `public_id`, not the raw source identifier.
- Korean descriptions render only when `description_ko` exists and `is_reviewed = true`.
- If the official GitHub import fails, the importer falls back to the local verified seed set.
