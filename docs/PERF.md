# Performance notes

## Current implementation

- MongoDB access uses the official driver and a shared connection client. Common user-scoped filters and sorts have dedicated indexes in `src/server/db/indexes.ts` (tasks by status/due date and project, active projects by status/activity, transactions by date, time entries, notes/inbox, and module-specific records).
- Dashboard reads execute concurrently with `Promise.all`; project task details are fetched in one bounded project-ID query rather than one request per project. Dashboard display lists are bounded, and transaction history is limited to the most recent 100 items.
- Finance month-to-date totals use Mongo aggregation grouped by currency/type or category/currency, avoiding client-side scans across a full transaction history for those summaries.
- Authenticated pages remain dynamic because their data is private and per-user. No shared response cache is used for private reads.
- Interactive code is isolated into client leaves for navigation, command palette, quick add, theme, and mutations. Route content and database reads remain Server Components.
- Route loading fallback and a root recovery boundary are in place. The shared UI provides shape-matched skeletons and per-module empty states where list data can be absent.

## Build measurement

The previous production build (before the UI redesign) reported 126 kB first-load JavaScript for `/` and 103 kB shared JavaScript in Next.js's route summary. The redesigned production build reports 146 kB first-load JavaScript on app routes (103 kB shared; the dashboard route contributes 1.22 kB). This is the framework's build summary, not a gzip budget measurement. The summary stays below 150 kB, while the shared shell adds about 20 kB compared with the earlier build.

## Measurement limits

- No Playwright package, browser automation tool, or Chrome DevTools connection is available in this workspace, so screenshots, Lighthouse, Core Web Vitals, and responsive browser checks have not been run. Do not treat visual or WCAG targets as measured.
- MongoDB credentials/runtime data are not available for this review. Query plans (`explain`) and index effectiveness under realistic data volume have not been measured.
- There is no before/after Lighthouse baseline. The current notes track what the code does and avoid claiming specific LCP/INP/CLS results.

## Follow-up

1. Run Lighthouse or Web Vitals collection against an authenticated seeded profile at 375px and 1440px.
2. Capture MongoDB `explain("executionStats")` for dashboard, task-board, notes search, finance ledger, and time-block queries against representative data.
3. Compare compressed route chunks after the redesign and consider a bundle analyzer before adding charting or rich-text dependencies.
4. Add per-query slow-operation telemetry with user identifiers removed or hashed; never log private record contents.
