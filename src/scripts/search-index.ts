import { ExecArgs, IProductModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { MEILISEARCH_MODULE } from "../modules/meilisearch"
import MeilisearchModuleService from "../modules/meilisearch/service"

function toSearchDocument(product: Record<string, any>) {
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    handle: product.handle,
    thumbnail: product.thumbnail,
    variant_sku: (product.variants ?? []).map((variant: any) => variant.sku).filter(Boolean).join(" "),
  }
}

export default async function searchIndexScript({ container }: ExecArgs) {
  const productModuleService: IProductModuleService = container.resolve(
    Modules.PRODUCT
  )
  const meilisearch: MeilisearchModuleService =
    container.resolve(MEILISEARCH_MODULE)

  const products = await productModuleService.listProducts(
    {},
    { relations: ["variants"] }
  )

  await meilisearch.indexData(products.map(toSearchDocument))
}
