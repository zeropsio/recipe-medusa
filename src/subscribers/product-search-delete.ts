import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { MEILISEARCH_MODULE } from "../modules/meilisearch"
import MeilisearchModuleService from "../modules/meilisearch/service"

export default async function productSearchDeleteHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const meilisearch: MeilisearchModuleService =
    container.resolve(MEILISEARCH_MODULE)

  await meilisearch.deleteFromIndex([data.id])
}

export const config: SubscriberConfig = {
  event: "product.deleted",
}
