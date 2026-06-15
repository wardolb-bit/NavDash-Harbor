# NavDash Harbor

Phase 1 vessel operations shell built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase Auth.

## Phase 1 Scope

- Username/password sign in surface backed by Supabase Auth
- No public signup route
- Persistent session until logout
- User role foundation: `admin`, `deck`, `engine`
- Full Harbor domain schema foundation for voyages, PMS, checklists, issues, notifications, audit log, documents, and voyage relations
- Protected global layout with navy sidebar and header
- Dashboard shell with the locked command-center structure
- Navigation destinations for future modules without building their workflows

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor. It creates the domain tables, enums, indexes, RLS policies, profile trigger, and private storage buckets.
3. Create users from the Supabase dashboard or admin tooling. To use simple usernames, set `NEXT_PUBLIC_USERNAME_EMAIL_DOMAIN` and create auth users as `username@that-domain`.
4. Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_USERNAME_EMAIL_DOMAIN=navdash.local
```

5. Install dependencies and run the app:

```bash
npm install
npm run dev
```

The app is Vercel-ready once the Supabase environment variables are configured.
