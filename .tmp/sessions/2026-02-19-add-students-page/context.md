# Task Context: Add Students Page

Session ID: 2026-02-19-add-students-page
Created: 2026-02-19T10:00:00Z
Status: in_progress

## Current Request
Create a page to add new students with two ways:
1. One by one through a regular HTML form.
2. Take a CSV as input to add multiple students at once, providing a CSV template, validating that the CSV is valid, and displaying errors correctly for any wrong entry.
Additional note: Add a library to validate emails (validator added).

## Context Files (Standards to Follow)
- /home/astro/.config/opencode/context/core/standards/security-patterns.md
- /home/astro/.config/opencode/context/core/standards/code-quality.md
- /home/astro/.config/opencode/context/ui/web/ui-styling-standards.md
- /home/astro/.config/opencode/context/ui/web/animation-forms.md
- /home/astro/.config/opencode/context/ui/web/react-patterns.md

## Reference Files (Source Material to Look At)
- src/lib/db/entities.ts
- src/lib/services/AlumnusService.ts
- package.json

## External Docs Fetched
- papaparse (CSV parsing)
- validator (Email validation)

## Components
1. **Validation Schemas**: Zod schemas for Alumnus validation.
2. **Server Actions**: Logic for creating alumni and bulk processing.
3. **Manual Entry Form**: React component for single entry.
4. **CSV Upload Component**: React component for CSV processing and error reporting.
5. **Add Students Page**: Integration page at `/alumni/new`.

## Constraints
- Use Zod for validation.
- Use Server Actions for mutations.
- Use `useTransition` for client-side calling.
- Strictly follow Tailwind CSS v4 patterns.
- Ensure type safety.

## Exit Criteria
- [ ] Manual form functional with validation.
- [ ] CSV upload functional with template download.
- [ ] CSV validation reports specific errors (line number, field, reason).
- [ ] All tests pass and code style conforms to Biome standards.
