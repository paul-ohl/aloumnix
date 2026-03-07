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
docker compose -f docker-compose.dev.yml up -d
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
| Start dev database | `docker compose -f docker-compose.dev.yml up -d` |
| Stop dev database | `docker compose -f docker-compose.dev.yml down` |

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

The repository ships with a `Dockerfile` and `docker-compose.prod.yml` that together run the Next.js app and a PostgreSQL database. Docker and Docker Compose are the only requirements on the host machine.

### 1. Create a production `.env` file

```bash
cp .env.example .env
```

Fill in every variable — there are no safe defaults in production:

```
DB_HOST=db
DB_PORT=5432
DB_USER=aloumnix
DB_PASSWORD=<strong password>
DB_NAME=aloumnix
JWT_SECRET=<output of: openssl rand -hex 32>
RESEND_API_KEY=<from resend.com>
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

> **`JWT_SECRET`** must be a strong random value. The fallback used in development is not safe for production.
> **`DB_HOST`** must be `db` — the Compose service name that the app container resolves to.

### 2. Build and start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

The app is available on port `3000` (override with `PORT=` in your `.env`). Place a reverse proxy (nginx, Caddy, Traefik) in front of it to terminate TLS.

### 3. Subsequent deploys

```bash
docker compose -f docker-compose.prod.yml up -d --build --no-deps app
```

This rebuilds and restarts only the `app` container without touching the database.

### 4. Stopping

```bash
docker compose -f docker-compose.prod.yml down
```

The `postgres_data` volume is preserved. To also remove the volume (destroys all data):

```bash
docker compose -f docker-compose.prod.yml down -v
```

---

### Database migrations in production

`synchronize: true` is disabled in production. After changing TypeORM entities, generate and apply a migration before deploying:

```bash
# On your dev machine — generates the migration file
pnpm exec typeorm migration:generate -d src/lib/db/data-source.ts src/lib/db/migrations/MyMigration

# Apply pending migrations (run inside the container or against the prod DB)
pnpm exec typeorm migration:run -d src/lib/db/data-source.ts
```

Tests are colocated with source files (`*.test.ts` / `*.test.tsx`) and use Vitest with jsdom.

```bash
pnpm test            # run all tests once
pnpm test:watch      # re-run on file change
```

The test suite covers service functions, server actions, and non-trivial component logic. Mocks for `next/navigation`, `next/headers`, and the TypeORM data source are set up per-file with `vi.mock`.
