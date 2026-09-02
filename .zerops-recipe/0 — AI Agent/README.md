# Medusa — AI Agent Environment
This is an AI agent environment for [Medusa (info + deploy)](https://app.zerops.io/recipes/medusa?environment=ai-agent) recipe on [Zerops](https://zerops.io).

<!-- #ZEROPS_EXTRACT_START:intro# -->
**AI agent** environment deploys the Medusa backend (`medusa`) and Next.js storefront (`nextstore`) with hobby PostgreSQL, Valkey, Meilisearch, and public-read object storage. Both apps use their production setups — the recipe has no idle `setup: dev` — so an agent can hit `/health` and `/app` immediately after import.
<!-- #ZEROPS_EXTRACT_END:intro# -->
