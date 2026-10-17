# Decisions

- Product name: **Personna**. Use this name in app identity and product documentation.
- Persistence: MongoDB with the official Node.js driver. Do not introduce Prisma or SQL. Database settings are `MONGODB_URI` and `MONGODB_DB`.
- Authentication: Auth.js credentials with bcrypt hashes and JWT sessions. The CLI seed creates the initial account; rerunning it never resets that account's password. Login requests are limited to ten attempts per IP in a fixed 15-minute bucket, and nonexistent accounts use a dummy bcrypt comparison to reduce account enumeration via timing.
- All user-owned data queries and mutations derive their `ObjectId` from the verified session. Client-provided IDs are validated and then scoped to that user. Content uses soft-delete fields; exports omit credentials and deleted records.
- Default locale/timezone are `en-RW` / `Africa/Kigali`, and base currency is RWF. RWF amounts use whole francs; USD uses cents. Manual transaction entry converts major units to integer minor units using the selected account's currency.
- `AI_ENABLED` is off by default. No AI provider is called or receives user data in the current build; the assistant UI reports when provider configuration is absent.
- The mobile-money parser is deterministic and conservative. Users review a candidate and explicitly confirm import; only transaction fields and a SHA-256 deduplication hash are persisted.
- Date-only inputs and planned time blocks are converted from the user's configured IANA timezone to UTC instants on the server; habit logs and dashboard date boundaries use the same configured timezone.
- Active-project capacity is checked on the server at creation and activation. Concurrent activations can race without a MongoDB transaction/locking strategy; use a replica-set-backed atomic reservation before enabling high-concurrency multi-user deployment.
- The delivered module surfaces are first usable vertical slices. Budgets, savings goals, debts, and sample records have MongoDB-backed surfaces. Learning progress is editable. Advanced calendar drag interactions, project-linked milestones, offline optimistic behavior, an AI provider/tools, richer notes search/editing, and Playwright journeys remain follow-up work; do not represent them as complete.
