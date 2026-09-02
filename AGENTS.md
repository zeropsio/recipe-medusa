# recipe-medusa

Medusa v2.19 commerce backend + admin on Zerops (`nodejs@22`, Yarn 1.22). Pair with [recipe-medusa-nextstore](https://github.com/zeropsio/recipe-medusa-nextstore). Analog is a separate recipe — keep `ANALOG_STORE_URL` in CORS. Not a Medusa v1 app and not a monorepo.

## Zerops service facts

- Hostname / `zeropsSetup`: `medusa`
- HTTP port: `9000` (`/health`, admin at `/app`)
- Siblings:
  - `db` — PostgreSQL `postgresql:single@17` — `DATABASE_URL`
  - `redis` — Valkey 7.2 — `REDIS_URL`, `CACHE_REDIS_URL`, `EVENTS_REDIS_URL`, `WE_REDIS_URL`, `LOCKING_REDIS_URL`
  - `search` — Meilisearch — `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`
  - `storage` — MinIO — `MINIO_*`
  - `nextstore` — Next.js SSR storefront (other Git repo, port 8000)
- Runtime base: `nodejs@22`

Pipeline: [`zerops.yml`](zerops.yml). Environment imports (0–5, same as the recipes catalog): [`.zerops-recipe/0 — AI Agent`](.zerops-recipe/0%20—%20AI%20Agent) through [`.zerops-recipe/5 — Highly-available Production`](.zerops-recipe/5%20—%20Highly-available%20Production). Standalone demo copy: [`.zerops-recipe/zerops-project-development-import.yml`](.zerops-recipe/zerops-project-development-import.yml).

## Zerops dev

This recipe ships `setup: medusa` only (no idle `setup: dev`). Local and agent work:

- Dev command: `yarn dev` (`medusa develop` — http://localhost:9000)
- In-container / local rebuild: `yarn build`
- Schema: `yarn migrate` then `yarn syncLinks`
- Demo data: `yarn seedInitialData` (once; do not assume it re-runs)

Copy [`.env.template`](.env.template) to `.env` for local. Package manager is **Yarn 1** — do not switch to npm.

**All platform operations (start/stop/status/logs, deploy, env / scaling / storage / domains) go through the Zerops development workflow via `zcp` MCP tools. Don't shell out to `zcli`.**

## Notes

- Pin every `@medusajs/*` package to **2.19.0**. Use the Caching Module (`@medusajs/medusa/caching` + `@medusajs/caching-redis`) with `MEDUSA_FF_CACHING=true` — not deprecated `cache-redis`.
- Register event-bus Redis, workflow-engine Redis, and locking Redis (they may share one Valkey URL). File module is MinIO via `@medusajs/medusa/file-s3` with `forcePathStyle: true`.
- SMTP: `src/modules/smtp-notification/` on the `email` channel when `SMTP_HOST` is set; empty host uses the local notification logger so the recipe boots without SMTP secrets.
- Official Medusa v2 add-ons (see [integrations](https://docs.medusajs.com/resources/integrations)): Draft Orders plugin (`@medusajs/draft-order`); Translation Module + `featureFlags.translation`; Analytics Module (local, or PostHog when `POSTHOG_EVENTS_API_KEY` is set); Stripe Payment Module Provider when `STRIPE_API_KEY` is set; Google/GitHub Auth providers when those client IDs are set (always keep `auth-emailpass`). Do not add `@rokmohar/medusa-plugin-meilisearch`, SendGrid (SMTP is the recipe email path), PayPal (custom provider, not a first-party package), or OpenTelemetry unless asked.
- Search: in-repo `src/modules/meilisearch/` — do **not** add `@rokmohar/medusa-plugin-meilisearch` (it breaks on 2.19). Empty `MEILISEARCH_HOST` is a no-op.
- Subscribers: `order.placed` (email + analytics), `customer.created`, `auth.password_reset`, product search sync. New commerce logic goes in modules + workflows + subscribers, not ad-hoc API-route services. Module links use `ContainerRegistrationKeys.LINK` (not `REMOTE_LINK`).
- Seed (`src/scripts/seed.ts`) is B2C + B2B **channels, customer groups, and a wholesale price list only**. Do not copy [medusajs/b2b-starter](https://github.com/medusajs/b2b-starter) (companies/quotes) unless asked.
- Value store is generic (`APP_URL` / `API_URL` plus aliases `NEXT_STORE_URL` / `MEDUSA_INSTANCE_URL`). Map framework keys in `zerops.yml` from `APP_URL` / `API_URL` only. Never add `envVariables` on import **service** blocks. `ADMIN_CORS` ← `API_URL`.
- First-deploy `initCommands` (`zsc execOnce`): migrate + sync-links keyed by `${appVersionId}`; superadmin, seed, publishable key (`CHANNEL_PUBLISHABLE_KEY`), and search index run **once per service lifetime**.
- Do not invent Zerops `type` values; verify against the [type list](https://docs.zerops.io/references/import-yaml/type-list). Do not drop Postgres, Valkey, Meilisearch, or MinIO without an explicit request. Do not enable OpenTelemetry in `instrumentation.ts` unless asked. Do not commit `.env`, secrets, or `.medusa/`.
