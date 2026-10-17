# Personna

Personna is a private, MongoDB-backed personal operating system for daily tasks, projects, time, finances, learning, notes, goals, and habits.

## Run locally

1. Install Node.js 20+ and a MongoDB Community Server or Atlas database.
2. Copy `.env.example` to `.env.local`, set `MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`, `SEED_EMAIL`, and `SEED_PASSWORD`. Generate the secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"`.
3. Run `npm install`.
4. Run `npm run db:seed` to create the initial user and repeatable sample records across tasks, projects, notes, goals, habits, learning, time, and finance. The seed preserves existing account credentials and does not overwrite existing sample records.
5. Run `npm run dev` and sign in at <http://localhost:3000>.

Useful checks: `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build`.

## Security and data

Credentials use bcrypt and Auth.js JWT sessions. Seed data never overwrites an existing account password. Authenticated reads and server actions scope user records to the verified session ID. Mongo collections have user/filter indexes. Exports at Settings download active user-owned data as JSON or transactions as CSV; password hashes are not exported.

AI stays disabled by default and is not connected to an external provider in this build. Mobile-money import parses conservatively, shows a review candidate, requires explicit confirmation, and stores a hash for deduplication rather than retaining the pasted message.

See [the master plan](docs/MASTER_PROMPT.md) and [implementation decisions](docs/DECISIONS.md) for the intended system scope and current limitations.
