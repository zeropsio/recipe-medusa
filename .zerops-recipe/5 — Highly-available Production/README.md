# Medusa — Highly-available Production Environment
This is a highly-available production environment for [Medusa (info + deploy)](https://app.zerops.io/recipes/medusa?environment=highly-available-production) recipe on [Zerops](https://zerops.io).

<!-- #ZEROPS_EXTRACT_START:intro# -->
**Highly-available production** environment runs two backend and two storefront containers, HA PostgreSQL, and HA Valkey on a SERIOUS project core. Meilisearch stays single-node (no cluster type). Demo DB profile is `oltp-staging`, not `oltp-production`.
<!-- #ZEROPS_EXTRACT_END:intro# -->
