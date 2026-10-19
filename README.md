# Personna

Personna is a private, MongoDB-backed personal operating system for daily tasks, projects, time, finances, learning, notes, goals, and habits.

## Run locally

1. Install Node.js 20+ and a MongoDB Community Server or Atlas database.
2. Copy `.env.example` to `.env.local`, set `MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`, `SEED_EMAIL`, and `SEED_PASSWORD`. Generate the secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"`. Set `NEXT_PUBLIC_SITE_URL` to the public origin for correct Open Graph and sitemap URLs; analytics remain off unless explicitly enabled with Plausible settings.
3. Run `npm install`.
4. Run `npm run db:seed` to create the initial user and repeatable sample records across tasks, projects, notes, goals, habits, learning, time, and finance. The seed preserves existing account credentials and does not overwrite existing sample records.
5. Run `npm run dev`, visit the public marketing page at <http://localhost:3000>, create an account with **Start free**, or sign in at `/login`. The authenticated workspace is at `/dashboard`.

Useful checks: `npm run db:check` pings the configured MongoDB without printing connection details; `npm run db:seed` idempotently creates the initial user and sample records. Also use `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build`.

## Security and data

Credentials use bcrypt and Auth.js JWT sessions. Seed data never overwrites an existing account password. Authenticated reads and server actions scope user records to the verified session ID. Mongo collections have user/filter indexes. Exports at Settings download active user-owned data as JSON or transactions as CSV; password hashes are not exported.

AI stays disabled by default and is not connected to an external provider in this build. Mobile-money import parses conservatively, shows a review candidate, requires explicit confirmation, and stores a hash for deduplication rather than retaining the pasted message.

See [the master plan](docs/MASTER_PROMPT.md) and [implementation decisions](docs/DECISIONS.md) for the intended system scope and current limitations.

## Deploy to Cloudflare Workers

This project uses the OpenNext Cloudflare adapter to run the existing Next.js App Router, middleware, and Server Actions on Workers. Keep production mode on the Node.js runtime; the Worker configuration enables `nodejs_compat` for Auth.js, bcrypt, and the MongoDB driver.

1. Create a MongoDB Atlas cluster reachable from Cloudflare Workers. Allowlist the connection source as required by your Atlas network policy; do not use a broad public allowlist unless you have intentionally accepted that exposure.
2. Set `MONGODB_URI` and `AUTH_SECRET` as Worker secrets in the Cloudflare dashboard or with `npx wrangler secret put MONGODB_URI` and `npx wrangler secret put AUTH_SECRET`. For Workers Builds, also add them to the build variables/secrets so server-side build steps can read them. Set `NEXT_PUBLIC_SITE_URL` as a build variable to the deployed origin. The non-secret database name defaults to `personna` in `wrangler.jsonc`.
3. Install dependencies and run `npm run preview:cloudflare` to build and exercise the app in the Workers runtime. Configure the local MongoDB URI and `AUTH_SECRET` in `.env.local` for local Next.js development; keep those values out of git. `npm run dev` runs Next.js natively and does not start Workerd. The OpenNext adapter warns that Windows is not a fully supported build environment, so use WSL or Linux for the Worker preview/build if it stalls or behaves differently.
4. Run `npm run deploy:cloudflare` from an authenticated Wrangler session, or connect the repository using Workers Builds with build command `npx @opennextjs/cloudflare build` and deploy command `npx @opennextjs/cloudflare deploy`.
5. Confirm the deployment’s runtime secrets and variables in Cloudflare after the first deploy, then verify `/api/health`, `/api/ready`, signup, login, and a write/read cycle against the production database.

Cloudflare Workers do not support reusing MongoDB sockets across requests. The Cloudflare database path therefore creates a request-scoped client; this is simplest for low traffic and pays connection setup latency. For higher traffic, migrate database access behind a MongoDB Durable Object connection service before launch. Backups, restore drills, custom-domain/HTTPS configuration, and account-level monitoring must also be configured in Cloudflare/MongoDB Atlas.
