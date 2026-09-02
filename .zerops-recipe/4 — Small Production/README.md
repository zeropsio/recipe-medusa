# Medusa — Small Production Environment
This is a small production environment for [Medusa (info + deploy)](https://app.zerops.io/recipes/medusa?environment=small-production) recipe on [Zerops](https://zerops.io).

<!-- #ZEROPS_EXTRACT_START:intro# -->
**Small production** environment is entry production for a just-launched shop — one backend container and one storefront container, `oltp-staging` PostgreSQL, and staging Valkey. App RAM stays at the Medusa / Next.js floors so the admin does not OOM on first boot.
<!-- #ZEROPS_EXTRACT_END:intro# -->
