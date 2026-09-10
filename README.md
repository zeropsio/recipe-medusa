# Zerops x Medusa.js

<!-- #ZEROPS_EXTRACT_START:intro# -->
Medusa v2.19 commerce backend plus a Next.js App Router storefront on Zerops. The stack includes PostgreSQL, Valkey, Meilisearch, MinIO object storage, optional SMTP notifications, Stripe, Google/GitHub login, analytics, translations, draft orders, and seed data for both B2C and B2B (sales channels, customer groups, and a wholesale price list).
<!-- #ZEROPS_EXTRACT_END:intro# -->

## Deploy to Zerops

You can either click the deploy button to deploy directly on Zerops, or manually copy an [`import.yaml`](.zerops-recipe/3%20—%20Stage/import.yaml) from [`.zerops-recipe/`](.zerops-recipe/) into the import dialog in the Zerops app. For a quick single-environment import, use [`.zerops-recipe/zerops-project-development-import.yml`](.zerops-recipe/zerops-project-development-import.yml) (same topology as Stage).

[![Deploy on Zerops](https://github.com/zeropsio/recipe-shared-assets/blob/main/deploy-button/light/deploy-button.svg)](https://app.zerops.io/recipes/medusa?environment=small-production)

Offered in examples for the whole development lifecycle — from environments for AI agents like [Claude Code](https://www.anthropic.com/claude-code) or [opencode](https://opencode.ai) through environments for remote (CDE) or local development of each developer to stage and productions of all sizes.

- **AI agent** [[info]](.zerops-recipe/0%20—%20AI%20Agent) — [[deploy with one click]](https://app.zerops.io/recipes/medusa?environment=ai-agent)
- **Remote (CDE)** [[info]](.zerops-recipe/1%20—%20Remote%20(CDE)) — [[deploy with one click]](https://app.zerops.io/recipes/medusa?environment=remote-cde)
- **Local** [[info]](.zerops-recipe/2%20—%20Local) — [[deploy with one click]](https://app.zerops.io/recipes/medusa?environment=local)
- **Stage** [[info]](.zerops-recipe/3%20—%20Stage) — [[deploy with one click]](https://app.zerops.io/recipes/medusa?environment=stage)
- **Small Production** [[info]](.zerops-recipe/4%20—%20Small%20Production) — [[deploy with one click]](https://app.zerops.io/recipes/medusa?environment=small-production)
- **Highly-available Production** [[info]](.zerops-recipe/5%20—%20Highly-available%20Production) — [[deploy with one click]](https://app.zerops.io/recipes/medusa?environment=highly-available-production)

Each folder under [`.zerops-recipe/`](.zerops-recipe/) contains an `import.yaml` you can paste in the Zerops UI. Canonical copies also live in [zeropsio/recipes/medusa](https://github.com/zeropsio/recipes/tree/main/medusa).

## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- Yarn 1.22
- PostgreSQL and Valkey (Redis-compatible) for local development

## Repositories

| Service | Repo | Port |
| --- | --- | --- |
| Medusa backend + admin | this repo | `9000` |
| Next.js storefront | [zeropsio/recipe-medusa-nextstore](https://github.com/zeropsio/recipe-medusa-nextstore) | `8000` |
| Analog.js storefront (optional) | separate recipe | — |

The Analog.js storefront remains a [separate recipe](https://app.zerops.io/recipe/medusa-analog-devel).

## Local backend

```bash
cp .env.template .env
yarn
yarn dev
```

Copy `.env.template` and set `DATABASE_URL` plus Redis URLs. Leave `SMTP_HOST` empty to log transactional emails instead of sending them.

## Admin login

Medusa Admin lives at **`/app`** on port `9000` (the Store API is the same host without that path). After first deploy, `yarn createInitialSuperadmin` creates the user once per service lifetime.

| Where | Open |
| --- | --- |
| Local | [http://localhost:9000/app](http://localhost:9000/app) |
| Zerops | `{API_URL}/app` — on the **medusa** service, use the public subdomain (port 9000), then go to `/app`. Signed-out users land on `/app/login`. |

Sign in with **email + password** (the default provider; Google/GitHub are optional extras).

| Field | Value |
| --- | --- |
| Email | `SUPERADMIN_EMAIL` — default `admin@example.com` |
| Password | `SUPERADMIN_PASSWORD` |

On Zerops those are **medusa service secrets**, not project env vars. Import sets the email to `admin@example.com` and generates the password (`s4lt_` plus a random suffix). In the Zerops UI: **medusa** service → environment / secrets → copy `SUPERADMIN_PASSWORD`. Locally they come from `.env` (template password is `supersecret`).

After login:

| Go to | What you will see |
| --- | --- |
| **Orders** | Incoming storefront checkouts |
| **Products** | Seed catalog |
| **Customers** | Retail / Wholesale groups from seed |
| **Price lists** | Wholesale list (~20% off) |
| **Settings → Regions** | Europe (EUR), United States (USD) |
| **Settings → Sales Channels** | Default (B2C) and B2B |
| **Settings → Developer → Publishable API Keys** | Key written to `CHANNEL_PUBLISHABLE_KEY` for the Next.js storefront |

The shop itself is the **nextstore** service (`APP_URL`, port `8000`) — not `/app`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Session store (Valkey/Redis) |
| `CACHE_REDIS_URL` / `EVENTS_REDIS_URL` / `WE_REDIS_URL` / `LOCKING_REDIS_URL` | Cache, events, workflow engine, locking (can reuse `REDIS_URL`) |
| `STORE_CORS` / `ADMIN_CORS` / `AUTH_CORS` | Browser origins |
| `BACKEND_URL` / `STOREFRONT_URL` | Public backend and storefront URLs (admin + password-reset links) |
| `MEDUSA_FF_CACHING` | Set `true` to enable the Redis Caching Module |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` / `SMTP_SECURE` | Optional transactional email. Empty host uses the local logger |
| `STRIPE_API_KEY` / `STRIPE_WEBHOOK_SECRET` | Optional Stripe. Empty key keeps manual checkout (`pp_system_default`). Webhook: `{BACKEND_URL}/hooks/payment/stripe_stripe` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Optional social login. Email+password remains the default |
| `POSTHOG_EVENTS_API_KEY` / `POSTHOG_HOST` | Optional PostHog. Empty key logs analytics locally |
| `MINIO_*` | S3-compatible object storage |
| `MEILISEARCH_HOST` / `MEILISEARCH_API_KEY` / `MEILISEARCH_PRODUCT_INDEX_NAME` | Product search (in-repo Meilisearch module; empty host skips indexing) |

Publishable API keys created by seed are written to `CHANNEL_PUBLISHABLE_KEY` on deploy and consumed by the Next.js storefront as `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` / `MEDUSA_PUBLISHABLE_KEY`. Deploy **medusa** before **nextstore** on first import (medusa has higher `priority` in import.yaml). The storefront start script waits for a resolved `pk_` key; medusa init triggers a nextstore reload after syncing the key so long-lived processes do not keep a stale `${medusa_CHANNEL_PUBLISHABLE_KEY}` literal.

## Seed data

The first deploy creates:

- Europe (EUR) and United States (USD) regions
- Default (B2C) and B2B sales channels
- Retail and Wholesale customer groups
- A wholesale price list (~20% off) for the Wholesale group
- Demo products, shipping, and a publishable API key

Full company / quote B2B (employees, spend limits) is the separate [Medusa B2B starter](https://github.com/medusajs/b2b-starter), not this recipe.

Need help setting your project up? Join the [Zerops Discord community](https://discord.gg/zeropsio).

<!-- #ZEROPS_EXTRACT_START:integration-guide# -->
## Integration Guide

### 1. Adding `zerops.yml`

Place [`zerops.yml`](zerops.yml) at the repository root. Setup name `medusa` must match `zeropsSetup` in the import yaml.

- Build: `nodejs@22`, Yarn 1, `yarn` then `yarn build`. Deploy `.medusa/server/~` plus `node_modules`.
- Run: port `9000`, health `/health`. Map `APP_URL` → `STOREFRONT_URL` / CORS and `API_URL` → `BACKEND_URL` / `ADMIN_CORS`.
- `initCommands` use `zsc execOnce`: migrate and sync-links per `${appVersionId}`; superadmin, seed, publishable key, and search index **once per service lifetime**.

Do not put `NEXT_PUBLIC_*` or other framework keys on import **service** `envVariables`. Project value store stays generic (`APP_URL` / `API_URL`); aliases `NEXT_STORE_URL` / `MEDUSA_INSTANCE_URL` remain for existing recipe buttons.

### 2. Key configuration points

- Caching Module + Redis (`MEDUSA_FF_CACHING=true`), not deprecated `cache-redis`.
- MinIO via `@medusajs/medusa/file-s3` with `forcePathStyle: true`.
- Empty `SMTP_HOST` logs email instead of sending.
- In-repo Meilisearch module; empty `MEILISEARCH_HOST` is a no-op. Do not add `@rokmohar/medusa-plugin-meilisearch`.
- Official v2 add-ons: Draft Orders plugin, Translation Module (`translation` flag), Analytics (local or PostHog), Stripe when `STRIPE_API_KEY` is set, Google/GitHub auth when those client IDs are set.
<!-- #ZEROPS_EXTRACT_END:integration-guide# -->
