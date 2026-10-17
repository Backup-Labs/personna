# Personna UI audit

Audit date: 2026-10-17. Scope: all application routes under `src/app`, shared shell, and global styles. This is a source review before the redesign; no live browser screenshots were captured at audit time.

## Global shell and design system

- Palette and Lucide icons are already in place, but spacing, controls, surface styles, and headings are repeated as ad hoc Tailwind classes instead of a documented component system.
- The desktop shell has a fixed sidebar but no topbar, page context, global quick-add menu, user menu, or timer indicator. The sidebar is not collapsible and has no section labels or active timer/user area.
- Mobile navigation currently exposes Dashboard, Tasks, Inbox, a capture FAB, and Projects; Finance and a full module sheet are missing. Capture uses a custom dialog without focus management.
- Content gutters are inconsistent with the requested 1440px content grid. Page headings vary in action placement and verbosity.
- A light theme is supported, but several pages hardcode dark surface/input classes, so theme parity is incomplete.
- Reduced-motion and visible focus styles exist globally. Contrast and mobile touch targets have not been measured in a browser.

## Route findings

| Route | Current strengths | Gaps before redesign |
| --- | --- | --- |
| `/dashboard` and `/` | Server-rendered, user-scoped aggregates; priorities, finance, projects, habits, schedule, inbox, and capture are represented. | Dense custom layout lacks a date-range control, independent tile streaming, and configurable zones. The weekly pulse is now present, but there is no momentum score or trend history. |
| `/projects` | Kanban columns, active-project capacity, next-action selection, create/status actions. | No board/list/timeline switch or filters; cards omit richer progress/task context; small columns can feel cramped; empty states are basic; no project detail view. |
| `/tasks` | Quick create, linked project/goal, completion and Top 3 controls. | Tasks are now grouped by overdue/today/upcoming/no date and completion. Inline add per group, date chips, filters, and keyboard task shortcuts remain. |
| `/time` | Persistent timer, conflict-aware block creation, recent entries. | The page now shows planned-vs-actual weekly totals and timezone-local upcoming blocks. A drag-enabled week/day calendar and persistent running-state timer pill remain. |
| `/finance` | Account balances, ledger, budgets, savings, debts, transaction entry, import flow. | A monthly income/outflow/savings summary now sits above the data views. Cash-flow visualization and ledger filters/pagination remain. |
| `/finance/import` | Explicit preview/confirmation and privacy explanation. | Minimal review hierarchy and no structured confidence/field summary or empty-state action beyond prose. |
| `/notes` | Recent note previews, bounded list, capture form, and MongoDB full-text search. | Still a list-and-capture layout rather than a three-pane editor; no folders or note editing surface. |
| `/inbox` | Tasks and notes can be cleared from the inbox. | Basic lists with low visual distinction, no triage actions for task conversion/project linking, keyboard flow, or per-item feedback. |
| `/growth` | Goals, one-click habit logs, 7-day habit strips, weekly review, saved reviews. | Goals lack measured milestone progress and habit streak summaries; review is one long form rather than a guided reflection. |
| `/learning` | Roadmap list, editable progress, summary counts. | No stepper/goal links, study-time history, upcoming milestones, or type-specific empty state. |
| `/assistant` | Clearly communicates provider/privacy state. | Intentionally informational only; no configured chat, prompt suggestions, context panel, or proposal flow. |
| `/settings` | Locale/currency/timezone/work limit, assistant toggle, data exports, security summary. | Single dense form, no section navigation or profile, incomplete preferences/privacy controls, save button rather than inline sections, and limited descriptions. |
| `/login` | Focused sign-in form with field autocomplete and error feedback. | Brand/field styling is mostly one-off; no pending state or reduced-motion-specific treatment. |
| `/design` | Not present. | No living style guide or place to spot token/component drift. |

## Redesign work completed

- Added a shared responsive shell with sticky page context, keyboard command access, desktop quick add, grouped/collapsible sidebar, and a mobile Home/Projects/Quick Add/Finance/More navigation sheet.
- Added reusable Card, CardHeader, CardFooter, StatTile, ProgressBar, ProgressRing, Badge, EmptyState, TileSkeleton, PageSkeleton, and SectionHeader patterns plus the `/design` style guide.
- Reorganized the dashboard into focus, weekly pulse, money/attention, and work/growth zones. The finance panel respects currency boundaries and now includes budget pace and savings progress.
- Reworked Settings into anchored sections; Tasks into date groups; Notes into searchable previews; and Time into localized upcoming blocks and weekly planned/actual summaries.
- Added root loading and error states, skip-to-content, consistent focus affordances, reduced-motion handling, and fixed nested route layouts that previously emitted duplicate document shells.

## Still requiring browser or product work

- Browser screenshots and breakpoints were not verified because Playwright/Chrome DevTools is not installed or connected in this workspace. See `docs/PERF.md` before claiming visual, Lighthouse, Core Web Vitals, or WCAG measurements.
- No account profile editing, settings autosave, notifications, offline queue, dashboard customization/range controls, drag calendar, project detail tabs, full notes editor, or AI provider flow was added in this UI pass.

## Priority order

1. Normalize shell, spacing, typography, surfaces, and responsive navigation.
2. Add the reusable card, stat, progress, badge, list, and state components plus a living `/design` page.
3. Reorganize the dashboard by user intent and improve its visible progress hierarchy.
4. Apply shared headers, empty states, loading states, and responsive/accessibility patterns across modules.
5. Profile/settings and module-specific interaction depth.
6. Measure bundle/runtime behavior and accessibility in a browser before claiming performance or WCAG targets.
