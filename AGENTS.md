# Agent Development Guide - Aloumnix

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 |
| Database | TypeORM 0.3 + PostgreSQL |
| Auth | JWT via `jose`, passwords via `bcryptjs` |
| Email | `resend` + `@react-email/components` |
| Validation | Zod v4 |
| Scraping | Cheerio |
| Linting/Formatting | Biome 2.2 |
| Testing | Vitest 4 + React Testing Library |
| Package Manager | `pnpm` |

---

## Commands

| Task | Command |
| :--- | :--- |
| Dev server | `pnpm dev` |
| Production build | `pnpm build` |
| Type check | `pnpm exec tsc --noEmit` |
| Lint + format (auto-fix) | `pnpm check` |
| Lint only (no fix) | `pnpm lint` |
| Run all tests | `pnpm test` |
| Run a single test file | `pnpm vitest run src/path/to/file.test.ts` |
| Watch tests | `pnpm test:watch` |
| Start database | `docker compose up -d` |
| Stop database | `docker compose down` |

**Always run `pnpm check` and `pnpm exec tsc --noEmit` after editing files. Both must produce zero errors before committing.**

---

## Project Structure

```
src/
  app/                    # Next.js App Router
    actions/              # Server Actions (mutations, named *Action)
    alumni/               # Alumnus-facing pages
    school/               # School-facing pages (dashboard, send-email, etc.)
    layout.tsx            # Root layout
    page.tsx              # Landing page
  components/
    auth/                 # Auth forms
    emails/               # React Email templates (*Email.tsx)
    events/               # Event CRUD UI (EventCard, EventList, EventDetailsModal…)
    jobs/                 # Job offering CRUD UI
  lib/
    auth/service.ts       # AuthService – session/JWT/password helpers
    db/
      data-source.ts      # getDataSource() singleton
      entities.ts         # All TypeORM entity classes (single file)
      seed.ts             # Dev seed data
    services/             # Business logic (*Service.ts + *Service.test.ts)
    validation/           # Zod schemas (*Schema + inferred *Input types)
    scraper.ts            # Cheerio scraping utilities
  test/setup.tsx          # Vitest global setup (jest-dom, next/image mock)
tests/
  fixtures/               # Shared test fixture data
```

---

## Code Style

### TypeScript
- Strict mode is on — no `any`. Use `unknown` and narrow, or cast with a comment.
- Use `interface` for object shapes; `type` for unions, aliases, and mapped types.
- Prefer named exports over default exports (Next.js page files are the exception).
- Use `!` (definite assignment assertion) on TypeORM entity columns, never `| undefined` in the column decorator.
- Avoid `as const` casts when a typed interface is sufficient.

### Imports
- Use the `@/` alias for all imports from `src/` (e.g. `import { AuthService } from "@/lib/auth/service"`).
- Biome auto-organizes import order on `pnpm check --write`. Never reorder manually.
- Import TypeORM types as `import type { … } from "typeorm"` when only used as types.

### Formatting
- 2-space indentation (Biome enforced).
- Double quotes for strings and JSX attributes.
- Trailing commas where valid (Biome default).
- Max line length is not hard-enforced, but keep JSX props readable.

### Naming
| Thing | Convention | Example |
| :--- | :--- | :--- |
| React components | PascalCase | `EventCard.tsx` |
| Hooks | camelCase + `use` prefix | `useDebounce.ts` |
| Server Actions | camelCase + `Action` suffix | `createEventAction` |
| Service functions | camelCase verbs | `getEvents`, `deleteEvent` |
| Files/folders (non-component) | kebab-case | `data-source.ts`, `send-email/` |
| Types/Interfaces | PascalCase | `SerializedEvent`, `EventFilters` |
| Zod schemas | camelCase + `Schema` suffix | `eventCreationSchema` |
| Zod inferred types | PascalCase + `Input` suffix | `EventCreationInput` |

### React & Next.js
- Default to **Server Components**. Add `"use client"` only when the component uses browser APIs, event handlers, or React state/effects.
- Use `useTransition` on the client when invoking Server Actions to track pending state.
- Prefer URL search parameters for shareable UI state (tabs, filters, pagination). Use `useState` only for purely ephemeral local state.
- Avoid global state libraries. Use React Context only for auth/theme.

### Styling (Tailwind CSS v4)
- Use utility classes directly in `className`. No CSS modules.
- Use the **`zinc` palette** for neutrals throughout (not slate, gray, or stone).
- Support dark mode with `dark:` prefix on every interactive/visible element.
- Card style: `bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6`.
- Selected/active ring: `ring-1 ring-zinc-900 dark:ring-zinc-50`.
- Icons: inline SVG only — `lucide-react` is **not** installed.

---

## Patterns

### Server Actions
```ts
"use server";

export async function myAction(input: MyInput) {
  const session = await AuthService.getSession();
  if (!session) return { error: "Unauthorized" };

  const validated = mySchema.safeParse(input);
  if (!validated.success) {
    return { error: "Validation failed", fieldErrors: validated.error.flatten().fieldErrors };
  }

  try {
    // ... mutation ...
    revalidatePath("/relevant/path");
    return { success: true };
  } catch (error) {
    console.error("Failed to do thing:", error);
    return { error: "Failed to do thing" };
  }
}
```
- Success path always returns `{ success: true, … }`.
- Error path always returns `{ error: string }` (no `success` key).
- All mutations require `session.role === "school"` or appropriate role check.
- Ownership must be verified — compare `entity.school.id` against `session.userId`.

### Services (`src/lib/services/`)
- Pure async functions; no class instances (except `AuthService` which is an object literal).
- Always call `await getDataSource()` at the top; then `dataSource.getRepository(Entity)`.
- Serialize dates to ISO strings **in the Server Action**, not in the service layer.

### Serialization to Client
- Never pass TypeORM entity instances to Client Components.
- Create a `Serialized*` interface in `src/components/<feature>/types.ts` with `string` dates.
- Serialize in the Server Action: `item.datetime.toISOString()`.

### TypeORM Entities (`src/lib/db/entities.ts`)
- All entities live in a single file.
- Use `@PrimaryGeneratedColumn("uuid")`, `@CreateDateColumn()`, `@UpdateDateColumn()`.
- Relations use arrow-function callbacks: `@ManyToOne(() => School, (s) => s.events)`.
- Always load relations explicitly with `relations: ["school"]` in queries; no eager loading.

### Validation (`src/lib/validation/`)
- One file per feature domain (e.g. `events.ts`, `jobs.ts`).
- Export the Zod schema and an `Input` type inferred from it.
- Use `z.string().uuid()` for ID fields, `z.string().min(n, "message")` for text.

### Email Templates (`src/components/emails/`)
- One file per email type (`GeneralEmail.tsx`, `JobEmail.tsx`, `EventEmail.tsx`).
- Use `@react-email/components` primitives (`Html`, `Body`, `Section`, `Text`, …).
- Rendered server-side via `@react-email/render` in `EmailService.ts`.

---

## Testing

- **Location:** Colocate test files with source (`*.test.ts` / `*.test.tsx`).
- **Environment:** `jsdom` (configured in `vitest.config.ts`). Import `"reflect-metadata"` at the top of any test that touches TypeORM entities.
- **Setup file:** `src/test/setup.tsx` — imports `@testing-library/jest-dom` and mocks `next/image`. Run automatically by Vitest.
- **Mocking pattern:** Use `vi.mock(…)` at module level; call `vi.clearAllMocks()` in `beforeEach`.
- **Test structure:** `describe` → nested `describe` per function → `it("verb + expectation")`. Use `// Arrange / // Act / // Assert` comments.
- **`next/navigation` redirect:** Mock as `vi.fn(() => { throw new Error("NEXT_REDIRECT") })` and assert with `rejects.toThrow("NEXT_REDIRECT")`.
- **Run a single test:** `pnpm vitest run src/lib/services/EventService.test.ts`
- **Coverage:** Aim for full coverage of service functions and server actions; component tests for non-trivial UI logic.

---

## Agent Workflow

1. **Read before writing.** Check existing patterns in the relevant feature directory before creating new files.
2. **Respect Biome.** Run `pnpm check` after every edit session. Fix all reported issues before moving on.
3. **Type-check last.** Run `pnpm exec tsc --noEmit` after Biome passes. Zero errors required.
4. **No side effects.** Do not modify `package.json`, `tsconfig.json`, `biome.json`, or `vitest.config.ts` unless explicitly asked.
5. **App Router rules.** Default to Server Components. Never import server-only modules (`next/headers`, `next/cache`) inside Client Components.
6. **Commits.** Only commit when explicitly asked. Group changes logically. Use the `✨ feat:`, `🐛 fix:`, `♻️ refactor:` prefix style seen in git log.
7. **No pushing.** Never run `git push`. The user pushes themselves.

---

*Keep this file updated as the project evolves.*
