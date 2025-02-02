import {
  ExecArgs,
  IProductModuleService,
} from "@medusajs/framework/types"
import { Modules, SearchUtils } from "@medusajs/framework/utils"
import { MeiliSearchService } from '@rokmohar/medusa-plugin-meilisearch'

export default async function searchIndexScript({ container }: ExecArgs) {
  const productModuleService: IProductModuleService = container.resolve(
    Modules.PRODUCT
  )

  const meilisearchIndexService: MeiliSearchService = container.resolve(
    'meilisearch'
  )

  const products = await productModuleService.listProducts()

  await meilisearchIndexService.addDocuments('products', products, SearchUtils.indexTypes.PRODUCTS)

}
