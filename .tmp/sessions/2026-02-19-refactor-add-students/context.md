# Task Context: Refactor Add Students Feature

Session ID: 2026-02-19-refactor-add-students
Created: 2026-02-19T14:30:00Z
Status: in_progress

## Current Request
Refactor the "Add Students" page to handle dynamic school selection, fix NaN handling in CSV uploads, and improve component structure by separating server and client concerns.

## Context Files (Standards to Follow)
- /home/astro/.config/opencode/context/core/standards/code-quality.md
- /home/astro/.config/opencode/context/ui/web/react-patterns.md
- /home/astro/.config/opencode/context/ui/web/ui-styling-standards.md

## Reference Files (Source Material to Look At)
- src/app/alumni/new/page.tsx
- src/app/alumni/new/_components/CsvAlumnusUpload.tsx
- src/app/alumni/new/_components/ManualAlumnusForm.tsx
- src/lib/services/SchoolService.ts
- src/lib/db/entities.ts

## Components
- NewAlumnusPage (Server Component)
- NewAlumnusClient (Client Component)
- CsvAlumnusUpload (Refactored)
- ManualAlumnusForm (Refactored)

## Constraints
- Use Biome for formatting/linting.
- React 19 patterns.
- Atomic bulk uploads.
- UX: Do not clear form on error, autofocus first field.

## Exit Criteria
- [ ] School list is fetched on the server and passed to the client.
- [ ] User can select a school before adding students.
- [ ] CsvAlumnusUpload uses the selected schoolId.
- [ ] graduationYear in CSV is correctly validated for NaN.
- [ ] Success message timeout in CsvAlumnusUpload is cleaned up on unmount.
- [ ] biome check passes.
