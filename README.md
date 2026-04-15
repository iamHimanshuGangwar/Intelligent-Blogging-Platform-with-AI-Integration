# AiBlog Platform

A full-stack, production-grade AI-powered editorial platform built with Next.js 15, Supabase, and generative AI. AiBlog lets creators write, publish, and monetize content — and supports the full lifecycle from drafting to career advancement.

---

## Snapshot
<img width="1710" height="1075" alt="Image" src="https://github.com/user-attachments/assets/471e4a5c-eb45-49a5-932e-e8c12d0d841f" />

---

## Table of Contents

1. [Overview](#overview)
2. [Feature Highlights](#feature-highlights)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Project Structure](#project-structure)
6. [Database Schema](#database-schema)
7. [Authentication](#authentication)
8. [API Reference](#api-reference)
9. [Environment Variables](#environment-variables)
10. [Getting Started](#getting-started)
11. [Key User Flows](#key-user-flows)
12. [Admin Panel](#admin-panel)
13. [Internationalization](#internationalization)
14. [Monitoring & Observability](#monitoring--observability)
15. [Testing](#testing)
16. [Security](#security)
17. [Scalability](#scalability)
18. [Deployment](#deployment)
19. [Troubleshooting](#troubleshooting)

---

## Overview

AiBlog is a multi-surface platform serving three distinct user groups:

| Surface | Audience | Entry Point |
|---|---|---|
| Public content | Readers / visitors | `/`, `/blog`, `/community`, `/forum` |
| Creator workspace | Authenticated writers | `/dashboard`, `/editor` |
| Operations center | Admins | `/admin` |

---

## Feature Highlights

### AI-Powered Writing
- Rich markdown editor with slash commands, formatting toolbar, and block types
- Gemini-powered AI content generation, suggestions, and auto-complete
- ATS-optimized 7-step resume builder with template selection and PDF export
- AI sidebar assistant available throughout the editor

### Publishing & Content Management
- Draft → review → publish workflow with admin approval gate
- Content scheduling (`scheduled_for`) with automated publishing cron endpoint
- Blog post engagement: likes, comments, shares, view counters
- Star ratings and reviews per post with moderation
- Blog theme system with 10+ editorial categories and a custom theme creator

### Collaboration
- Invite co-authors by email with editor/viewer permission roles
- Real-time in-app notifications (Server-Sent Events stream)
- Email notifications for collaboration invites via Nodemailer SMTP

### Social & Community
- Follow / unfollow users; follow request flow for private profiles
- Community feed with posts, upvotes, and comments
- Forum with topic threads, replies, and category routing
- Inner Circle gated membership tier

### Career Tools
- Portfolio page per creator with project showcase
- 7-step resume wizard: personal info, experience, education, skills, projects, certifications, preview
- ATS score calculation and template-switching
- Job board (`/jobs`) with career path guides (`/careers`)

### Monetization
- Subscription plan management with tiered pricing
- Razorpay checkout integration (UPI, cards, netbanking)
- Payment idempotency via `processed_payments` table
- Newsletter signup and mailing list

### Discovery & Search
- Full-text search across posts (GIN index + `tsvector` trigger on `posts`)
- Global `/api/search` endpoint covering posts, users, and topics
- AI-powered recommendations endpoint

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React 19) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui, Radix UI primitives |
| Database | Supabase (PostgreSQL 15) |
| Auth | Clerk (social/Google OAuth) + custom OTP email flow + admin cookie session |
| AI | Google Gemini (`@google/generative-ai`), OpenAI (`openai`) |
| Payments | Razorpay |
| Email | Nodemailer (SMTP) |
| Image CDN | ImageKit |
| Rate Limiting | Upstash Redis + `@upstash/ratelimit` |
| Input Sanitization | `isomorphic-dompurify` |
| i18n | next-intl (cookie-based locale, no URL prefix changes) |
| Monitoring | Sentry (`@sentry/nextjs`) |
| Testing | Playwright (E2E) |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| State | Zustand |

---

## Architecture

```
Browser
  │
  ├── Next.js App Router (SSR / RSC / Client Components)
  │     ├── /app/...          Page routes
  │     ├── /app/api/...      Route handlers (REST API)
  │     └── /middleware.ts    Clerk + OTP + admin session auth guard
  │
  ├── Supabase
  │     ├── PostgreSQL        Primary datastore
  │     ├── Row Level Security Policies on all user tables
  │     └── Storage           (via ImageKit CDN proxy)
  │
  ├── External Services
  │     ├── Clerk             OAuth / JWT / social login
  │     ├── Razorpay          Payment gateway
  │     ├── Gemini / OpenAI   AI content generation
  │     ├── ImageKit          Image upload & CDN
  │     ├── Upstash Redis     Rate limiting
  │     └── SMTP              Transactional email
  │
  └── Monitoring
        └── Sentry            Error tracking (client + server + edge)
```

### Auth Strategy

Three session types co-exist and are resolved in middleware:

1. **Clerk session** — Google OAuth users; JWT verified server-side
2. **OTP session** — Email-only users; cookie `otp_session_token` holds a signed token
3. **Admin session** — Internal admins; cookie `admin_session_token`; scoped to `/admin` only

---

## Project Structure

```
aiblog/
├── app/
│   ├── api/                        All REST API route handlers
│   │   ├── admin/                  Admin-only endpoints (posts, users, audit)
│   │   ├── ai/                     AI generation endpoints
│   │   ├── analytics/              View and engagement analytics
│   │   ├── auth/                   OTP send/verify, resend-verification
│   │   ├── blog/                   Blog-specific public routes
│   │   ├── blog-themes/            Theme CRUD
│   │   ├── comments/               Post comments (with sanitization)
│   │   ├── community/              Community feed
│   │   ├── follows/                Follow / unfollow / follow requests
│   │   ├── forum/                  Forum topics and replies
│   │   ├── jobs/                   Job board listings
│   │   ├── likes/                  Post like toggle
│   │   ├── newsletter/             Mailing list signup
│   │   ├── notifications/          In-app notifications + SSE stream
│   │   ├── payments/razorpay/      Order creation + webhook verify
│   │   ├── portfolio/              Creator portfolio
│   │   ├── posts/                  Post CRUD, collaborators, reviews
│   │   ├── recommendations/        AI-powered post recommendations
│   │   ├── resume/                 Resume data and file exports
│   │   ├── search/                 Global full-text search
│   │   ├── subscriptions/          Plan + subscription management
│   │   └── user/                   Profile, stats, settings
│   │
│   ├── admin/                      Admin panel pages
│   ├── blog/[slug]/                Public post reader
│   ├── blog-themes/                Theme gallery
│   ├── careers/                    Career paths
│   ├── community/                  Community feed page
│   ├── dashboard/                  Creator workspace
│   │   ├── career/
│   │   ├── collaboration/
│   │   ├── insights/
│   │   ├── notifications/
│   │   ├── portfolio/
│   │   ├── posts/
│   │   ├── resume/                 7-step resume builder
│   │   └── settings/
│   ├── editor/                     Post editor
│   ├── forum/                      Forum
│   ├── inner-circle/               Gated membership
│   ├── jobs/                       Job board
│   └── pricing/                    Pricing / subscription plans
│
├── components/                     Shared React components
│   ├── ui/                         shadcn/ui base components
│   ├── AdminSideNav.tsx
│   ├── AIAssistantSidebar.tsx
│   ├── EmailVerificationBanner.tsx
│   ├── ErrorBoundary.tsx
│   ├── LanguageSwitcher.tsx
│   ├── NavBar.tsx
│   ├── NotificationsDropdown.tsx
│   ├── SideNavBar.tsx              Dashboard sidebar + mobile bottom tab bar
│   └── ...
│
├── lib/                            Server-side utilities
│   ├── admin-audit.ts              Admin action audit trail
│   ├── auth-helpers.ts             OTP token helpers
│   ├── blog-themes.ts              Theme registry
│   ├── gemini.ts                   Gemini AI client
│   ├── i18n.ts                     Locale constants and helpers
│   ├── imagekit.ts                 ImageKit upload helpers
│   ├── mailer.ts                   Nodemailer transport
│   ├── markdown.tsx                Markdown renderer
│   ├── rate-limit.ts               Upstash rate limit presets
│   ├── sanitize.ts                 DOMPurify input sanitization
│   └── types.ts                    Shared TypeScript types
│
├── context/
│   ├── AuthContext.tsx             Global auth state (Clerk + OTP)
│   └── AppContext.tsx
│
├── messages/                       i18n translation files
│   ├── en.json                     English
│   └── es.json                     Spanish
│
├── supabase/
│   └── migrations/                 Ordered SQL migrations
│
├── tests/
│   └── e2e/                        Playwright end-to-end tests
│       ├── homepage.spec.ts
│       ├── blog.spec.ts
│       ├── auth-and-public.spec.ts
│       └── api.spec.ts
│
├── i18n.ts                         next-intl request config
├── middleware.ts                   Edge auth + route protection
├── next.config.ts                  Next.js config (Sentry + next-intl)
├── playwright.config.ts
├── sentry.client.config.ts
├── sentry.server.config.ts
└── sentry.edge.config.ts
```

---

## Database Schema

All tables use TEXT primary keys (Clerk-compatible user IDs). Row Level Security is enabled on every user table.

### Core Tables

| Table | Purpose |
|---|---|
| `profiles` | User profiles, roles, verification status |
| `posts` | Blog posts with scheduling, approval, and FTS vector |
| `comments` | Post comments with optional guest support |
| `post_likes` | Like records per post per user |
| `post_reviews` | Star ratings and review text |
| `post_collaborators` | Co-author invites with roles |
| `notifications` | In-app notification inbox |
| `user_follows` | Accepted follows |
| `follow_requests` | Pending follow requests |
| `subscription_plans` | Plan definitions (free/pro/enterprise) |
| `user_subscriptions` | Active subscriptions per user |
| `processed_payments` | Idempotency log for Razorpay webhooks |
| `user_resumes` | Resume data (JSON sections + metadata) |
| `resume_files` | Exported PDF/DOC/PNG file references |
| `admin_audit_log` | Admin action trail (action, target, actor) |

### Applied Migrations

| File | Purpose |
|---|---|
| `20260402123000_schema_hardening_and_resume_fix.sql` | Core schema hardening |
| `20260402131500_scalability_and_payments.sql` | Payments, indexes, follow requests |
| `20260404100000_resume_builder_v2.sql` | Resume V2 columns and RLS policies |
| `20260404110000_search_scheduling_audit.sql` | FTS, scheduling, audit log, composite indexes |
| `20260404120000_email_verification.sql` | Email verification columns on profiles |

---

## Authentication

### Flows

```
Google OAuth (Clerk)
  └── /auth → Clerk sign-in → JWT → Clerk middleware validates

Email OTP
  └── /auth → enter email → POST /api/auth/otp/send → 6-digit code email
             → POST /api/auth/otp/verify → sets otp_session_token cookie
             → marks profile.email_verified = true

Admin Login
  └── /admin/login → POST /api/admin/login → sets admin_session_token cookie
                   → access restricted to /admin routes only
```

### Email Verification

After OTP verification, `profiles.email_verified` is set to `true`. Unverified users see an `EmailVerificationBanner` with a resend option (`POST /api/auth/resend-verification`).

---

## API Reference

All routes are under `/app/api/`. Protected routes require a valid Clerk JWT, OTP session cookie, or admin cookie depending on context.

### Posts

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/posts` | Public | List posts (paginated, filterable) |
| `POST` | `/api/posts` | User | Create a new post |
| `GET` | `/api/posts/[id]` | Public | Get single post |
| `PATCH` | `/api/posts/[id]` | Owner | Update post |
| `DELETE` | `/api/posts/[id]` | Owner/Admin | Delete post |

### Admin Posts

| Method | Path | Auth | Description |
|---|---|---|---|
| `PATCH` | `/api/admin/posts/[id]` | Admin | Approve, reject, or update any post |
| `POST` | `/api/admin/publish-scheduled` | Admin/Cron | Publish all scheduled posts past their `scheduled_for` time |

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/otp/send` | Public | Send OTP to email (rate limited) |
| `POST` | `/api/auth/otp/verify` | Public | Verify OTP, create session |
| `POST` | `/api/auth/resend-verification` | User | Resend verification email |
| `GET` | `/api/auth/resend-verification` | User | Get current verification status |

### Search & Discovery

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/search?q=` | Public | Full-text search across posts and users |
| `GET` | `/api/recommendations` | User | AI-powered post recommendations |

### Notifications

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | User | List notifications |
| `GET` | `/api/notifications/stream` | User | SSE stream for real-time notifications |
| `PATCH` | `/api/notifications/[id]` | User | Mark as read |

### Payments

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/payments/razorpay/order` | User | Create Razorpay order |
| `POST` | `/api/payments/razorpay/verify` | User | Verify payment signature (idempotent) |

### AI

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/ai/generate` | User | Generate content via Gemini (rate limited) |

---

## Environment Variables

Create `.env.local` from the template below:

```env
# ── Supabase ──────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ── App ───────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Clerk (OAuth) ─────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# ── OTP Email Auth ────────────────────────────────────────
OTP_SECRET=a-strong-random-secret-for-signing-otp-tokens
ADMIN_SESSION_SECRET=a-strong-random-secret-for-admin-cookies

# ── AI ────────────────────────────────────────────────────
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key          # optional

# ── Email (SMTP) ──────────────────────────────────────────
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=no-reply@example.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM="AiBlog <no-reply@example.com>"

# ── Payments (Razorpay) ───────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your-razorpay-secret

# ── Image CDN (ImageKit) ──────────────────────────────────
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id

# ── Rate Limiting (Upstash Redis) ─────────────────────────
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# ── Monitoring (Sentry) ───────────────────────────────────
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project
- Clerk application (for Google OAuth)

### Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/itsAkito/Advance-aiblog-Platform.git
cd Advance-aiblog-Platform

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Fill in your values (see Environment Variables above)

# 4. Push database schema
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm run start
```

---

## Key User Flows

### Writing & Publishing

```
/editor
  → Write in markdown with AI assistance
  → Save as draft (POST /api/posts)
  → Submit for review → admin approves
  → OR schedule with scheduled_for timestamp
  → Published post visible at /blog/[slug]
```

### Razorpay Payment

```
/pricing
  → Select plan → POST /api/payments/razorpay/order
  → Razorpay Checkout opens in browser
  → On success → POST /api/payments/razorpay/verify (signature check + idempotency)
  → POST /api/subscriptions to activate plan
```

### Real-Time Notifications

```
Client connects to GET /api/notifications/stream  (SSE)
  → Server polls for new notifications every 15s
  → Pushes JSON events to browser
  → NotificationsDropdown updates count/badge live
```

### Collaboration Invite

```
Editor owner → invite by email
  → POST /api/posts/[id]/collaborators
  → Resolves profile by email → inserts post_collaborators row
  → Creates collab_invite notification for invitee
  → Sends email via Nodemailer
  → Collaborator sees post in their dashboard with role badge
```

### Resume Builder

```
/dashboard/resume
  7-step wizard:
    1. Personal Info
    2. Work Experience
    3. Education
    4. Skills
    5. Projects
    6. Certifications
    7. Preview & Export
  → ATS score calculated live
  → Export to PDF/PNG via html-to-image
  → File saved to resume_files table
```

---

## Admin Panel

Available at `/admin` (requires admin cookie session from `/admin/login`).

| Section | Path | Function |
|---|---|---|
| Dashboard | `/admin` | Platform KPIs and recent activity |
| Posts | `/admin/posts` | Review, approve, reject, delete posts |
| Users | `/admin/users` | View users, change roles |
| Moderation | `/admin/moderation` | Comment and content moderation |
| Analytics | `/admin/analytics` | Engagement and traffic charts |
| Settings | `/admin/settings` | Platform configuration |
| Support | `/admin/support` | Support ticket queue |
| Themes | `/admin/themes` | Blog theme management |
| Career Paths | `/admin/career-paths` | Career guides management |

All admin actions are written to `admin_audit_log` via `lib/admin-audit.ts`.

---

## Internationalization

Cookie-based locale switching with no URL prefix changes. Supported locales:

| Code | Language |
|---|---|
| `en` | English (default) |
| `es` | Español |
| `fr` | Français |
| `de` | Deutsch |
| `ja` | 日本語 |

The `LanguageSwitcher` component in the navbar writes to the `NEXT_LOCALE` cookie and reloads the page. Translation files live in `messages/`.

Adding a new locale:
1. Create `messages/xx.json` mirroring `messages/en.json`
2. Add the locale code to `LOCALES` in `lib/i18n.ts`
3. Add a label to `LOCALE_LABELS` in `lib/i18n.ts`

---

## Monitoring & Observability

Sentry is configured on all runtimes:

| Config File | Runtime |
|---|---|
| `sentry.client.config.ts` | Browser — 10% trace sample rate, PII stripped |
| `sentry.server.config.ts` | Node.js server — 5% trace sample rate |
| `sentry.edge.config.ts` | Edge middleware |

Sentry events are tunneled through `/monitoring` to avoid ad-blocker interference. Source maps are only uploaded in `production` builds.

Required env vars: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`.

---

## Testing

### E2E Tests (Playwright)

```bash
# Run all tests headlessly
npm run test:e2e

# Run with interactive UI
npm run test:e2e:ui
```

Test suites in `tests/e2e/`:

| File | Coverage |
|---|---|
| `homepage.spec.ts` | Page load, nav visible, no critical console errors |
| `blog.spec.ts` | Blog reachable, meta title, 404 handling |
| `auth-and-public.spec.ts` | Auth page, admin login, unauthenticated redirect, 5 public pages |
| `api.spec.ts` | `/api/posts`, `/api/search`, AI generate 400/429, OTP rate limit smoke test |

Playwright targets Chromium (desktop) and Pixel 5 (mobile). The config starts `npm run dev` automatically when not in CI.

---

## Security

| Concern | Implementation |
|---|---|
| Rate limiting | Upstash Redis sliding window on OTP send, AI generate, auth, newsletter |
| Input sanitization | DOMPurify on all user-generated HTML (comments, post content) |
| Payment integrity | `crypto.timingSafeEqual` for Razorpay HMAC signature verification |
| Payment idempotency | `processed_payments` table deduplicates webhook replays |
| SQL injection | Supabase parameterized queries throughout; no raw string interpolation |
| XSS | Content-Security-Policy headers; DOMPurify on render |
| Auth cookies | `HttpOnly`, `SameSite=Strict`, signed with secrets |
| Row Level Security | Enabled on all Supabase user tables |
| Admin audit trail | All admin mutations logged to `admin_audit_log` |
| Error boundary | `ErrorBoundary` component wraps the root layout |

---

## Scalability

Optimizations already in place:

- **GIN full-text index** on `posts` with auto-updating `tsvector` trigger
- **Composite indexes** on hot query paths: notifications, follows, comments, collaborators
- **`Cache-Control: immutable`** on `/_next/static/` assets
- **`Cache-Control: no-store`** on all `/api/` routes
- **Connection pooling** via Supabase SSR client (respects `SUPABASE_DB_POOL_URL`)
- **Partial index on `posts`** for pending-approval admin queue

Recommended at scale:

- Enable Supabase connection pooler (PgBouncer) for high concurrency
- Deploy to Vercel Edge Network or similar CDN-aware host
- Add a background job queue (e.g. Inngest, BullMQ) for bulk emails and analytics aggregation
- Monitor p95 DB query latency and cache hit ratio in Supabase dashboard

---

## Deployment

### Vercel (recommended)

1. Connect the GitHub repository in Vercel dashboard
2. Set all environment variables from the [Environment Variables](#environment-variables) section
3. Deploy — Next.js App Router is auto-detected

### Docker / Self-hosted

```bash
npm run build
npm run start
# Runs on PORT env var (default 3000)
```

Ensure reverse proxy (nginx/Caddy) forwards requests and sets appropriate headers (`X-Forwarded-For`, `X-Real-IP`).

---

## Troubleshooting

### `supabase db push` fails with "policy already exists"

Migrations now use idempotent `DO $$ IF NOT EXISTS $$` guards. If hitting this on older migration files, run with `--debug` to identify the statement and wrap it manually.

### OTP emails not arriving

- Verify `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` in `.env.local`
- Check that port 587 (STARTTLS) or 465 (SSL) is open from your host
- Check spam folder; ensure `SMTP_FROM` matches your sending domain

### Resume save error — missing `public.user_resumes`

Run the migration: `supabase db push` (applies `20260404100000_resume_builder_v2.sql`). The API has a fallback to the legacy schema but the migration is required for full V2 functionality.

### Razorpay signature verification failing

- Confirm `RAZORPAY_KEY_SECRET` matches the live/test key in your Razorpay dashboard
- Ensure the webhook payload is read as raw bytes (`req.text()`) before HMAC — do not parse as JSON first

### Sentry not receiving events

- Confirm `NEXT_PUBLIC_SENTRY_DSN` is set and correct
- In development, Sentry is disabled (`enabled: process.env.NODE_ENV === 'production'`)
- Check that `/monitoring` is not blocked by middleware or a reverse proxy

### Razorpay Checkout Not Opening

- Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- Confirm browser can load `https://checkout.razorpay.com/v1/checkout.js`

## Security Practices

- Service role usage is kept on server route handlers
- Payment signature is verified server-side using HMAC SHA-256
- Collaboration and subscription actions require authenticated user context
- Row-level policies should be kept enabled in Supabase for production

## Repository

- Repository: Advance-aiblog-Platform
- Owner: itsAkito
- Branch: main
