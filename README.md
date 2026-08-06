# Ladies Taylor

Marketing site + lightweight CMS for Ladies Taylor (Social Media Management, Branding, Packaging, Website Development), plus events and a blog ("Press & Media").

Built on Next.js 16 (App Router) + React 19 + Tailwind 4, backed by Supabase (content, auth, storage) and Resend (transactional email).

## Stack

- **Framework:** Next.js 16 — note the App Router file conventions here differ from older Next.js versions (`src/proxy.ts` instead of `middleware.ts`, `unstable_retry` instead of `reset` in `error.tsx`, etc.). Check `node_modules/next/dist/docs/` before assuming standard behavior.
- **Data/Auth:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`) — Postgres with Row Level Security, email/password auth for the admin panel, Storage for media.
- **Email:** Resend, for contact-form and newsletter-signup notifications.
- **Editor:** Tiptap, for blog post rich text in the admin panel.
- **Styling:** Tailwind CSS 4, custom design tokens in `src/app/globals.css` (see `DESIGN.md` for the full system).
- **Validation:** Zod on every public API route.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in:

   | Variable | Where to get it |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings → API (anon/public key) |
   | `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys |
   | `CONTACT_NOTIFICATION_EMAIL` | Inbox that should receive contact-form/newsletter notifications |
   | `NEXT_PUBLIC_SITE_URL` | Production origin, no trailing slash (used for SEO metadata, sitemap, robots.txt); defaults to `http://localhost:3000` for local dev |

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Admin panel

`/admin` is the CMS: brands, events, press/media posts, the homepage "desktop" hero content, media library, and the contact-form leads inbox. It's gated by Supabase Auth (email/password) — see `src/proxy.ts` for the redirect pre-filter and `src/lib/admin/dal.ts`'s `verifySession()` for the real per-request auth check used by every admin page and Server Action.

There's no public sign-up flow; create admin users directly in the Supabase dashboard under Authentication.

## Scripts

```bash
npm run dev     # start the dev server (Turbopack)
npm run build   # production build
npm run start   # run the production build
npm run lint    # ESLint
```

## Deployment

Deploys to Vercel. Set all the environment variables above in the Vercel project settings — `NEXT_PUBLIC_SITE_URL` in particular should be the real production domain, not localhost.
