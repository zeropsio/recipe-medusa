const { Meilisearch } = require("meilisearch")
import { MedusaError } from "@medusajs/framework/utils"

type MeilisearchOptions = {
  host?: string
  apiKey?: string
  productIndexName?: string
}

export type MeilisearchIndexType = "product"

export default class MeilisearchModuleService {
  private client?: InstanceType<typeof Meilisearch>
  private options: MeilisearchOptions

  constructor({}, options: MeilisearchOptions = {}) {
    this.options = {
      productIndexName: options.productIndexName || "products",
      ...options,
    }

    if (options.host && options.apiKey) {
      this.client = new Meilisearch({
        host: options.host,
        apiKey: options.apiKey,
      })
    }
  }

  private getClient() {
    if (!this.client) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Meilisearch is not configured. Set MEILISEARCH_HOST and MEILISEARCH_API_KEY."
      )
    }
    return this.client
  }

  async getIndexName(type: MeilisearchIndexType = "product") {
    switch (type) {
      case "product":
        return this.options.productIndexName || "products"
      default:
        throw new Error(`Invalid index type: ${type}`)
    }
  }

  async indexData(
    data: Record<string, unknown>[],
    type: MeilisearchIndexType = "product"
  ) {
    if (!this.client) {
      return
    }
    const index = this.getClient().index(await this.getIndexName(type))
    await index.updateSettings({
      searchableAttributes: ["title", "description", "variant_sku"],
      displayedAttributes: [
        "id",
        "title",
        "description",
        "variant_sku",
        "thumbnail",
        "handle",
      ],
    })
    await index.addDocuments(data)
  }

  async deleteFromIndex(
    documentIds: string[],
    type: MeilisearchIndexType = "product"
  ) {
    if (!this.client || !documentIds.length) {
      return
    }
    const index = this.getClient().index(await this.getIndexName(type))
    await index.deleteDocuments(documentIds)
  }

  async search(query: string, type: MeilisearchIndexType = "product") {
    const index = this.getClient().index(await this.getIndexName(type))
    return await index.search(query)
  }
}
