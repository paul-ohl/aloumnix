# Agent Development Guide - Aloumnix

This document provides essential information for autonomous agents working on the Aloumnix codebase.

## 🛠 Tech Stack & Tools

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescript.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Database:** [TypeORM](https://typeorm.io/) with [PostgreSQL](https://www.postgresql.org/)
- **Scraping:** [Cheerio](https://cheerio.js.org/)
- **Linting/Formatting:** [Biome](https://biomejs.dev/)
- **Package Manager:** `pnpm` (workspace detected)

## 🚀 Common Commands

| Task | Command |
| :--- | :--- |
| **Development** | `pnpm dev` |
| **Build** | `pnpm build` |
| **Check (Lint/Format)** | `pnpm check` |
| **Type Check** | `pnpm exec tsc --noEmit` |
| **Run All Tests** | `pnpm test` |
| **Run Single Test File** | `pnpm vitest run path/to/file` |
| **Watch Tests** | `pnpm test:watch` |
| **Start Database** | `docker compose up -d` |
| **Stop Database** | `docker compose down` |

### Testing Guidelines
- **Framework:** [Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).
- **Location:** Place test files alongside the code they test (e.g., `ComponentName.test.tsx`).
- **Environment:** Use `jsdom` for component/integration tests.
- **Coverage:** Aim for high coverage of business logic and critical UI components.
- **Mocking:** Use Vitest's mocking utilities for external dependencies.

## 🎨 Code Style & Conventions

### 1. General Principles
- **Strict TypeScript:** Always use types. Avoid `any`.
- **Functional Components:** Use function declarations for components.
- **Modern React:** Use React 19 features where appropriate (e.g., `use` hook, server actions).

### 2. Formatting & Linting
- **Indentation:** 2 spaces (configured in `biome.json`).
- **Imports:** Biome automatically organizes imports. Use the `@/` alias for absolute imports from `src/`.
- **Quotes:** Prefer double quotes for JSX and strings unless single quotes are needed for escaping.

### 3. Naming Conventions
- **Components:** PascalCase (e.g., `UserProfile.tsx`).
- **Hooks:** camelCase with `use` prefix (e.g., `useAuth.ts`).
- **Files/Folders:** kebab-case for everything except components (e.g., `api-client.ts`, `auth-provider/`).
- **Types/Interfaces:** PascalCase (e.g., `UserResponse`). Use `interface` for object shapes, `type` for unions/aliases.

### 4. Styling (Tailwind CSS)
- Use utility classes directly in `className`.
- Follow the mobile-first approach.
- Use the `zinc` palette for neutrals (as seen in `page.tsx`).
- Support Dark Mode using the `dark:` prefix.

### 5. Error Handling
- Use `try/catch` blocks for asynchronous operations.
- Implement [Next.js Error Boundaries](https://nextjs.org/docs/app/building-your-application/routing/error-handling) using `error.tsx` in the app directory.
- Provide user-friendly error messages.

### 6. Project Structure
- `src/app/`: App Router pages, layouts, and Server Actions.
- `src/components/`: Reusable UI components.
- `src/hooks/`: Custom React hooks.
- `src/lib/db/`: TypeORM configuration and entities.
- `src/lib/services/`: Business logic and database interactions.
- `src/lib/scraper.ts`: Web scraping utilities using Cheerio.
- `public/`: Static assets.

### 7. Database & Persistence (TypeORM)
- **Entities**: Defined in `src/lib/db/entities/`. Use `!` for definite assignment on columns.
- **Connection**: Use `getDataSource()` from `src/lib/db/data-source.ts` to get the initialized connection.
- **Environment**: Configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `.env.local`.

### 8. Server Actions & Data Fetching
- **Data Fetching**: Prefer fetching data directly in Server Components using TypeORM repositories. Use `cache` from `react` if the same data is needed in multiple components.
- **Server Actions**: Use Server Actions for all mutations. Define them in `src/app/actions.ts` or close to the feature. Always use `useTransition` on the client when calling them.
- **Validation**: Use `zod` to validate all inputs in Server Actions before processing.

### 9. State Management
- **URL as State**: Prefer using search parameters for UI state (filters, tabs, etc.) to ensure shareability.
- **Local State**: Use `useState` only when necessary for interactive client components.
- **Global State**: Avoid global state libraries (Redux, Zustand) unless the application complexity strictly requires it. Prefer React Context for theme or authentication.

## 🤖 Agent Workflow Instructions

1. **Verify Before Action:** Use `ls` and `grep` to ensure you understand the existing patterns.
2. **Respect Biome:** Always run `pnpm check` after modifying files. Biome is strict about formatting and suspicious patterns.
3. **App Router Conventions:** Adhere to Next.js App Router rules (Server vs. Client components). Default to Server Components; add `"use client"` only when necessary.
4. **No Side Effects:** Do not modify `package.json` or `tsconfig.json` unless explicitly requested.
5. **Atomic Commits:** If asked to commit, ensure changes are logically grouped and the message follows the project style.

---
*Generated by opencode. Keep this file updated as the project evolves.*
