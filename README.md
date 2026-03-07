# Aloumnix

A private alumni portal for schools. Schools manage their graduates, publish events, post job opportunities, and send targeted emails. Alumni log in passwordlessly via a one-time code and access a personal dashboard.

---

## Tech stack

| Layer | Technology |
| :--- | :--- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 |
| Database | TypeORM 0.3 + PostgreSQL |
| Auth | JWT via `jose`, passwords via `bcryptjs` |
| Email | `resend` + `@react-email/components` |
| Validation | Zod v4 |
| Linting / Formatting | Biome 2.2 |
| Testing | Vitest 4 + React Testing Library |
| Package manager | pnpm |

---

## Project structure

```
src/
  app/
    actions/          # Server Actions (mutations)
    alumni/           # Alumni-facing pages (dashboard)
    login/            # Login pages (school + alumni OTP)
    school/           # School-facing pages (dashboard, send-email…)
    page.tsx          # Marketing homepage
  components/
    auth/             # Login forms
    emails/           # React Email templates
    events/           # Event CRUD UI
    jobs/             # Job offering CRUD UI
  lib/
    auth/service.ts   # AuthService – JWT sessions, password hashing
    db/
      data-source.ts  # TypeORM DataSource singleton
      entities.ts     # All entity classes (School, Alumnus, Event…)
      seed.ts         # Dev seed data (runs automatically)
    services/         # Business logic (*Service.ts)
    validation/       # Zod schemas
  proxy.ts            # Next.js middleware (auth guard, redirect_to)
  test/setup.tsx      # Vitest global setup
tests/
  fixtures/           # Shared test fixture data
```

---

## Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (`npm install -g pnpm`)
- **Docker** (for the local PostgreSQL database)

---

## Local development

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example file and fill in the values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
| :--- | :---: | :--- |
| `DB_HOST` | Yes | PostgreSQL host (default: `localhost`) |
| `DB_PORT` | Yes | PostgreSQL port (default: `5432`) |
| `DB_USER` | Yes | PostgreSQL user (default: `postgres`) |
| `DB_PASSWORD` | Yes | PostgreSQL password (default: `postgres`) |
| `DB_NAME` | Yes | Database name (default: `aloumnix`) |
| `JWT_SECRET` | Yes | Secret used to sign session JWTs. Use a long random string in production. |
| `RESEND_API_KEY` | Yes | API key from [resend.com](https://resend.com). Without it, emails are silently skipped. |
| `NEXT_PUBLIC_APP_URL` | No | Public base URL (default: `http://localhost:3000`). Used to build deep-links in emails. |
| `NODE_ENV` | No | Set to `development` locally. Controls DB sync, logging, and cookie security. |

### 3. Start the database

```bash
docker compose up -d
```

This starts PostgreSQL on port `5432` and Adminer (a web database GUI) on port `8080`.

### 4. Start the dev server

```bash
pnpm dev
```

The app is available at [http://localhost:3000](http://localhost:3000).

On first boot in development mode, the database schema is auto-synced via TypeORM's `synchronize: true` option and a seed script populates it with sample schools, alumni, events, and job offerings.

---

## Commands

| Task | Command |
| :--- | :--- |
| Dev server | `pnpm dev` |
| Production build | `pnpm build` |
| Start production server | `pnpm start` |
| Type check | `pnpm exec tsc --noEmit` |
| Lint + format (auto-fix) | `pnpm check` |
| Lint only (no fix) | `pnpm lint` |
| Run all tests | `pnpm test` |
| Run a single test file | `pnpm vitest run src/path/to/file.test.ts` |
| Watch tests | `pnpm test:watch` |
| Start database | `docker compose up -d` |
| Stop database | `docker compose down` |

---

## Authentication

### Schools

Schools log in at `/login/school` with a username (school selector) and password. Sessions are issued as HTTP-only JWT cookies (2-hour expiry). On first login, schools are redirected to `/set-password` to set their initial password.

### Alumni

Alumni log in at `/login/alumni` using a passwordless OTP flow:

1. Alumni enter their email address.
2. A 6-digit one-time code is emailed to them via Resend (valid for 10 minutes).
3. They enter the code to receive a session cookie.

Email links (event invites, job postings) include a `?redirect_to=` parameter so alumni are taken directly to the relevant item in their dashboard after login.

---

## Database

TypeORM manages the schema. In `development`, `synchronize: true` is enabled — the schema is kept in sync with entity definitions automatically. **Do not use `synchronize: true` in production.** For production, generate and run migrations manually:

```bash
# Generate a migration after changing entities
pnpm exec typeorm migration:generate -d src/lib/db/data-source.ts src/lib/db/migrations/MyMigration

# Run pending migrations
pnpm exec typeorm migration:run -d src/lib/db/data-source.ts
```

### Entities

| Entity | Description |
| :--- | :--- |
| `School` | A school account with name, location, and hashed password |
| `Alumnus` | A graduate belonging to a school |
| `AlumnusOtp` | One-time codes for alumni login (TTL-based, one per alumnus) |
| `Event` | An event created by a school |
| `JobOffering` | A job posting created by a school |

---

## Email

Emails are sent via [Resend](https://resend.com). Set `RESEND_API_KEY` in your environment. Without it, the application runs normally but email sends are silently no-ops (a warning is logged server-side).

Email templates live in `src/components/emails/`:

| Template | Use |
| :--- | :--- |
| `OtpEmail.tsx` | Alumni login OTP code |
| `EventEmail.tsx` | Event invitation with deep-link to the alumni dashboard |
| `JobEmail.tsx` | Job opportunity with a direct application link |
| `GeneralEmail.tsx` | General message to alumni |

---

## Self-hosting (production)

Aloumnix is a standard Next.js application and can be hosted anywhere that supports Node.js.

### Option A — Node.js server

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start          # starts on port 3000 by default
```

Set `PORT` to override the port. Use a reverse proxy (nginx, Caddy) in front of it.

### Option B — Docker

A minimal `Dockerfile` example:

```dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

> This requires `output: "standalone"` in `next.config.ts`. Add it if you use this approach.

### Option C — Vercel

Deploy directly from the repository. Set all environment variables in the Vercel project settings. The database must be accessible from Vercel's network (use a managed PostgreSQL provider such as Supabase, Neon, or Railway).

### Required environment variables in production

```
DB_HOST=
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=<long random secret>
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

> **Important:** `JWT_SECRET` must be a strong random value (e.g. `openssl rand -hex 32`). The fallback value used in development is not safe for production.

---

## Testing

Tests are colocated with source files (`*.test.ts` / `*.test.tsx`) and use Vitest with jsdom.

```bash
pnpm test            # run all tests once
pnpm test:watch      # re-run on file change
```

The test suite covers service functions, server actions, and non-trivial component logic. Mocks for `next/navigation`, `next/headers`, and the TypeORM data source are set up per-file with `vi.mock`.
