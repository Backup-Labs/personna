# MASTER PROMPT — Personna — Personal Operating System

> Paste everything below the line into your AI editor (Cursor, Windsurf, Claude Code, etc.) as the first message. Keep this file in the repo as `/docs/MASTER_PROMPT.md` and tell the AI to re-read it at the start of every session.

---

## 0. ROLE

You are a principal-level engineer team in one: a product thinker, a senior system architect with 20 years of experience, a senior frontend engineer (Next.js, React, Tailwind) and a senior backend engineer (MongoDB, API design, security). You write production-grade code, make decisions yourself, and explain only the decisions that matter. You do not ask for permission for routine choices. You do not leave TODOs, placeholder data, or fake buttons.

## 1. MISSION

Build **Personna — Personal Operating System**: one private, single-user web app that runs my whole life from one place. Motto: *One system. Every responsibility. Meaningful progress.*

This is MY personal system first. Optimize for daily use by one person, but keep the architecture multi-tenant-ready (every row has a `userId`) so it can become a SaaS later without a rewrite.

Core principle: **the modules are not separate apps. They share one data graph.** A task belongs to a project, a project serves a goal, time entries attach to tasks, expenses attach to projects, learning items attach to goals. The dashboard and AI read across all of it.

## 2. NON-NEGOTIABLE CONSTRAINTS

- Stack: **Next.js (App Router, latest stable) + TypeScript (strict) + Tailwind CSS + MongoDB (MongoDB Node.js driver)**.
- UI: shadcn/ui (Radix primitives) restyled to the design system below, `lucide-react` icons, `framer-motion` for subtle motion, `recharts` for charts, `date-fns` for dates, `zod` for all validation, `react-hook-form` for forms.
- Auth: Auth.js (NextAuth v5) with credentials + optional Google. Hash with argon2 or bcrypt. All data access is scoped by the session `userId` on the server. Never trust the client.
- Data mutations through **Server Actions** (validated with zod); reads through Server Components where possible; Route Handlers only for webhooks, exports, and AI streaming.
- Money is stored as **integers in minor units with an explicit currency code** (RWF has 0 decimals, USD has 2). Never use floats for money. Support **RWF and USD** from day one, with a base currency setting and manual FX rate table.
- Mobile-first responsive. Must work well at 375px and 1440px.
- Accessible: keyboard navigable, visible focus rings, AA contrast, `prefers-reduced-motion` respected.
- No feature gets built that is not in this document unless it is necessary for another feature to work.
- Keep dependencies minimal. Justify any package beyond the list above.

## 3. DESIGN SYSTEM — "Futuristic Editorial"

Premium, minimal, calm, slightly futuristic. Dense dashboards, no clutter. Dark mode is the default; light mode uses the tan palette. The look: deep navy surfaces, warm tan text/surfaces, and glowing strawberry-to-eggplant gradients used as **accents and light sources**, never as full-page backgrounds.

### 3.1 Color tokens (exact values — do not invent new brand colors)

| Token | Name | Hex | Use |
|---|---|---|---|
| `--ink` | Hēi Sè Black | `#142030` | Dark mode page background, light-mode text |
| `--whale` | Blue Whale | `#1E3442` | Dark mode cards/surfaces, sidebar |
| `--grauzone` | Grauzone | `#85A3B2` | Muted text, borders, secondary icons, chart neutral |
| `--tan` | Siesta Tan | `#E9D8C8` | Light mode background, dark-mode primary text |
| `--strawberry` | Stellar Strawberry | `#FF5C8D` | Primary accent, CTAs, active states, focus rings |
| `--eggplant` | Pico Eggplant | `#732553` | Secondary accent, gradient depth, selected surfaces |

Derived tokens (generate with `color-mix`/opacity, keep them in CSS variables):
- `--surface-1` = `--whale`, `--surface-2` = `--whale` lightened ~6%, `--surface-3` = `--whale` lightened ~12%
- `--border` = `--grauzone` at 18% opacity (dark), 30% (light)
- Semantic: success `#5FD3A5`, warning `#F2B45A`, danger `#FF5C6C` (danger must remain visually distinct from strawberry: use it only for destructive actions and negative money)

### 3.2 Gradients (the signature)

Define as CSS variables and Tailwind utilities:

```css
--grad-glow: radial-gradient(circle at 80% 0%, #FFE4EC 0%, #FF5C8D 22%, #732553 55%, transparent 78%);
--grad-aurora: linear-gradient(135deg, #FF5C8D 0%, #732553 55%, #1E3442 100%);
--grad-depth: linear-gradient(180deg, #1E3442 0%, #142030 100%);
--grad-mist: linear-gradient(135deg, #85A3B2 0%, #1E3442 100%);
--grad-border: linear-gradient(135deg, #FF5C8D66, #73255333, #85A3B222);
```

Usage rules:
- **Glow orb**: a blurred `--grad-glow` sphere (absolute, `blur-3xl`, 40–60% opacity) behind the hero card of the dashboard and behind the sidebar logo. It reads as a light source, like the pink sphere in the reference palette.
- **Gradient hairline borders** on featured cards (`--grad-border` via mask or 1px padding trick).
- Primary buttons: solid strawberry, with a soft strawberry glow shadow on hover (`0 0 24px #FF5C8D55`).
- Charts: strawberry (primary series), grauzone (neutral), eggplant (secondary), tan (highlights). Area charts fill with a strawberry→transparent gradient.
- Subtle film-grain/noise overlay at 3–4% opacity on the app background for a premium feel.
- Never put body text on a bright gradient region. Keep text on `--surface-*` for contrast.

### 3.3 Typography & shape

- Fonts via `next/font`: **Space Grotesk** (headings, numbers) and **Inter** (body) — or Geist if preferred. **JetBrains Mono** for small data labels, IDs, and contrast-ratio style micro-labels (uppercase, tracked, 11px).
- Large tabular numerals for money and stats (`font-variant-numeric: tabular-nums`).
- Radius: cards `20px`, inputs/buttons `12px`, chips `999px`. Generous spacing (8px grid). Soft shadows only.
- Layout: **color-block bento grid** for the dashboard — rectangular tiles of different sizes in the palette colors (ink, whale, tan, strawberry, eggplant, grauzone), exactly like the reference swatch grid. One or two tiles per screen may be a solid strawberry or eggplant block for emphasis.
- Persistent left sidebar on desktop (collapsible), bottom tab bar on mobile with a center "+" quick-capture button.
- Global command palette (`Cmd/Ctrl+K`) for navigation and quick capture.
- Motion: 150–250ms ease-out, number count-ups on dashboard load, soft fade/slide on route change. Nothing bouncy.

## 4. INFORMATION ARCHITECTURE

Eight modules, one shared graph. Routes under `/(app)`:

1. `/dashboard` — Life Dashboard
2. `/finance` — accounts, transactions, budgets, savings, debts, reports
3. `/projects` — projects, milestones, tasks, backlog (ideas vs commitments)
4. `/time` — calendar, time blocks, timer, planned-vs-actual
5. `/learning` — goals/roadmaps, resources, subjects & exams, study sessions, portfolio link
6. `/notes` — inbox, notes, tags, folders, saved links
7. `/growth` — goals, habits, daily check-in, weekly/monthly review
8. `/assistant` — AI chat plus a persistent side panel available everywhere

Plus: `/inbox` (global capture inbox), `/settings` (profile, currency, FX, active-project limit, AI privacy, export, backup).

## 5. DATA MODEL (MongoDB — implement this, extend only when needed)

Conventions: `id` is cuid, every user-owned collection document has a `userId`, `createdAt`, `updatedAt`; soft-delete (`deletedAt`) on user content; index `userId` plus the main filter fields.

Core entities:

- **User**, **Settings** (baseCurrency, locale, timezone, activeProjectLimit, weekStartsOn, aiEnabled, aiContextScopes)
- **Goal** (title, why, area, targetDate, status, progress computed) → has **Milestone[]**
- **Project** (title, status `IDEA|PLANNED|ACTIVE|PAUSED|COMPLETED`, priority, deadline, goalId?, lastActivityAt, nextActionTaskId?) → has **Milestone[]**, **Task[]**, **Note[]**, **Transaction[]**, **TimeEntry[]**
- **Task** (title, notes, status `INBOX|TODO|DOING|DONE`, priority, dueDate, estimateMin, projectId?, milestoneId?, goalId?, recurrenceRule?, parentTaskId?, isTop3Today)
- **TimeBlock** (start, end, title, taskId?, projectId?, category) and **TimeEntry** (start, end, taskId?, projectId?, learningItemId?, source `TIMER|MANUAL`)
- **Account** (name, type `CASH|MOMO|BANK|CARD|OTHER`, currency, openingBalance)
- **Transaction** (accountId, type `INCOME|EXPENSE|TRANSFER`, amountMinor Int, currency, categoryId, occurredAt, note, projectId?, counterpartAccountId? for transfers, recurringRuleId?, importHash? for dedupe)
- **Category** (name, kind, color, parentId?), **Budget** (categoryId, period, amountMinor, currency), **SavingsGoal** (target, current computed, deadline, isEmergencyFund), **Debt** (direction `OWED_BY_ME|OWED_TO_ME`, party, principal, due, payments[])
- **RecurringRule** (for tasks, transactions, routines; RRULE-style)
- **LearningGoal / Skill** (name, targetLevel, currentLevel, goalId?), **LearningItem** (type `COURSE|BOOK|VIDEO|ARTICLE|SUBJECT`, status, progress, skillId?), **Exam** (subject, date, topics[]), **StudySession** (derived from TimeEntry)
- **Note** (title, bodyJson/markdown, type `NOTE|IDEA|DECISION|MEETING|LINK`, inbox flag, projectId?, goalId?, learningItemId?, tags via **Tag**/**NoteTag**), **Attachment** (url, mime, size)
- **Habit** (name, cadence, target, goalId?) and **HabitLog** (habitId, date, status `DONE|SKIPPED|MISSED`, note)
- **Review** (type `DAILY|WEEKLY|MONTHLY`, period, wins, lessons, obstacles, nextFocus, autoSummaryJson)
- **AiThread / AiMessage** (role, content, contextRefs, createdAt), **AuditLog** (action, entity, entityId, before/after) for sensitive operations

Rules the schema and service layer must enforce:
- Transfers never count as income or expense in reports. Balances = opening balance + signed transaction sums per account.
- Moving a project to ACTIVE when `activeProjectLimit` is reached must be blocked with a clear message and a "pause one first" picker.
- An IDEA never appears in task lists or the calendar.
- Deleting anything with children asks for confirmation and soft-deletes.

## 6. MODULE REQUIREMENTS

### 6.1 Dashboard
Bento grid, all values from real data:
- Hero tile with glow orb: greeting, date, **Today's Top 3** (set/reorder with drag), progress ring for the day.
- Tiles: due today / overdue / upcoming, today's timeline, active projects with progress bars and "next action", cash position and month spend vs budget (RWF/USD toggle), habit strip for the week, goal progress, inbox count, "neglected" alert (projects inactive for N days).
- Quick capture bar (task, expense, note) available on every page via `Cmd+K` and the mobile "+" button. Capture must take under 5 seconds and no more than one required field.

### 6.2 Finance
- Manual entry first. Fast add: amount, category, account, date defaults to now.
- **Mobile-money paste import**: a textarea where I paste MTN MoMo / Airtel Money SMS messages or statement text. A pure, unit-tested parser (`lib/finance/parse-momo.ts`) extracts amount, direction, counterparty, fees, balance, timestamp, transaction ID, then shows a **review table** before saving. Dedupe with `importHash`. Make parsers pluggable per provider and keep AI out of the parsing path unless regex fails (AI fallback requires my confirmation).
- Budgets per category with progress bars (green, then amber, then red thresholds), monthly and weekly summaries, savings goals, debts and receivables, recurring items, spending-pattern charts, month-over-month comparison.
- CSV export of transactions.

### 6.3 Projects
- Kanban (by status) plus list view. Backlog column holds ideas.
- Project page: overview, tasks, milestones, notes, linked transactions, time spent, decisions log, activity timeline.
- Task sub-features: subtasks, estimates, due dates, recurrence, drag-reorder, bulk actions, keyboard shortcuts.
- Every ACTIVE project must have exactly one "next action"; warn when missing.
- Show **project profitability** when linked income and time exist: income minus expenses, divided by hours (effective hourly rate).

### 6.4 Time
- Day/Week/Month calendar with drag-to-create and drag-to-resize time blocks; tasks can be dragged from a side list onto the calendar.
- Start/stop timer (global, persistent in the header), manual entries.
- Conflict detection, overload warning when planned minutes exceed available hours.
- Weekly report: planned vs actual, by category/project, with a chart.

### 6.5 Learning & Career
- Skill roadmaps with levels, resources with progress, exams with countdowns and auto-generated revision blocks, study timer integrated with Time, portfolio projects linked to Projects, career milestones.

### 6.6 Notes
- Fast markdown editor (Tiptap or a lean alternative), slash commands, tags, folders, full-text search (MongoDB text indexes), backlinks, saved links, **Inbox triage flow**: process each item into a task, project, goal, note, or discard (keyboard-driven).
- "Convert to task/project/goal" actions on any note.

### 6.7 Goals, Habits, Growth
- Goals with milestones that roll up from linked projects/tasks. Habits with flexible cadence (daily, N times per week). Streaks are shown alongside a **consistency %** and are forgiving: a "skip with reason" option protects the streak.
- Daily check-in (60 seconds): top 3, mood/energy, one win, one blocker.
- Weekly review wizard prefilled from data (completed tasks, project movement, spend vs budget, time by category, habit consistency) with prompts for wins, lessons, obstacles, and next week's focus. Saved as a `Review`.

### 6.8 AI Assistant
- Provider-agnostic via the Vercel AI SDK; model and key from env; streaming responses.
- **Tool-calling over my own data, read-only by default**: `getTodayContext`, `listOverdue`, `listInactiveProjects`, `getSpendingSummary`, `getTimeAllocation`, `getGoalProgress`, `getUpcomingExams`. Write actions (`createTask`, `moveProjectStatus`, `addTransaction`, `deleteX`) are **proposals** rendered as confirm cards; nothing mutates until I click Confirm.
- Privacy: per-scope toggles in Settings (finance, notes, tasks…). Send only the minimal fields needed; never send full note bodies unless the scope is enabled. Log every tool call.
- Built-in prompts: "What should I focus on today?", "Plan my week around my exams", "Which projects have gone quiet?", "Summarize my spending this month", "What should I postpone?".
- Generate the **AI Weekly Debrief**: what I did, where time and money went, what I neglected, and what to cut next week. Show it as a card and save it into the weekly review.
- All AI output is labeled as assistance, not financial/academic/professional advice.

## 7. ENGINEERING STANDARDS

Folder structure:

```
/src
  /app
    /(auth)  /(app)/dashboard|finance|projects|time|learning|notes|growth|assistant|inbox|settings
    /api     (ai stream, export, webhooks only)
  /components  /ui (shadcn restyled)  /charts  /layout  /features/<module>
  /server
    /actions/<module>.ts     (zod-validated server actions)
    /services/<module>.ts    (business logic, pure and testable)
    /queries/<module>.ts     (read models for dashboards)
    /ai/ (tools, prompts, privacy filters)
  /lib   (db, auth, money, dates, rrule, utils, parse-momo)
  /styles/tokens.css
/src/server/db  collections.ts  indexes.ts  seed.ts
/docs    MASTER_PROMPT.md  DECISIONS.md  ROADMAP.md
```

- Business rules live in `/server/services`, not in components. Components stay thin.
- Every server action: authenticate, authorize (userId scope), validate (zod), execute, `revalidatePath`/`revalidateTag`, return a typed result (`{ ok, data | error }`).
- Money utilities (`lib/money.ts`): `toMinor`, `fromMinor`, `format(amountMinor, currency)`, `convert`. Unit-test them.
- Tests: Vitest for services and parsers (finance math, MoMo parser, recurrence, active-project limit, balance calculation); Playwright for 3 happy paths (capture → organize → complete; add expense → budget updates; weekly review).
- Performance: server-render dashboards, cache read models with tags, paginate lists, optimistic updates for task toggles and habit checks, skeleton loaders instead of spinners.
- Security: rate-limit auth and AI routes, CSRF-safe actions, secure cookies, env validation with zod at boot, no secrets in client bundles, MongoDB Atlas encryption at rest in production, nightly backups, one-click full JSON + CSV export in Settings.
- Include `.env.example`, a `README` with setup in under 5 commands, seed data that makes every screen look alive (realistic RWF amounts, projects, habits, a few notes).
- Conventional commits; one logical change per commit.

## 8. BUILD PLAN — execute in this order, one phase at a time

After each phase: run typecheck, lint, tests, and the dev build; fix everything; then summarize what shipped in 5 lines, list any assumptions in `DECISIONS.md`, and **continue to the next phase without waiting** unless blocked.

**Phase 1 — Foundation:** project scaffold, Tailwind tokens + gradients + fonts, shadcn restyle, app shell (sidebar, mobile tab bar, command palette, theme toggle), MongoDB collection schemas + indexes + seed, Auth.js, settings page skeleton.

**Phase 2 — Core loop:** Inbox/quick capture, Tasks, Projects (with ideas vs active limit), Notes basics, Dashboard v1 with real data and Top 3.

**Phase 3 — Time:** calendar, time blocks, timer, planned-vs-actual, recurrence engine.

**Phase 4 — Finance:** accounts, transactions, categories, budgets, savings, debts, MoMo paste importer, reports, RWF/USD.

**Phase 5 — Growth & Learning:** goals/milestones, habits, daily check-in, weekly review wizard, learning roadmaps, exams, study sessions.

**Phase 6 — AI:** assistant with read tools, confirm-card write proposals, privacy scopes, weekly debrief, inactivity and overload alerts.

**Phase 7 — Hardening:** tests, a11y pass, performance pass, export/backup, empty states, error boundaries, polish animations, final README.

## 9. QUALITY BAR (definition of done for every screen)

- Uses only design-system tokens; no hard-coded hex outside `tokens.css`.
- Has loading, empty, and error states, all designed (empty states have a clear single call to action).
- Works on mobile and desktop; keyboard accessible; AA contrast.
- Data comes from the database; no mock arrays in components.
- Typed end to end; no `any`; no unused code; no console noise.
- Feels fast: perceived response under 100ms on common actions via optimistic UI.

## 10. START NOW

Do not ask clarifying questions. Make sensible decisions and record them in `DECISIONS.md`. Begin **Phase 1** immediately: scaffold the project, implement the design tokens and gradients from Section 3, build the app shell, and show me the dashboard skeleton running with the glow-orb hero tile and bento layout using seeded data. Then proceed through the phases in order.

