import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function orderPlacedAnalyticsHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const analyticsModuleService = container.resolve(Modules.ANALYTICS)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: ["id", "customer_id", "total", "items.variant_id", "items.product_id", "items.quantity"],
    filters: { id: data.id },
  })

  if (!order) {
    return
  }

  await analyticsModuleService.track({
    event: "order_placed",
    actor_id: order.customer_id ?? undefined,
    properties: {
      order_id: order.id,
      total: order.total,
      items: order.items?.map((item) => ({
        variant_id: item?.variant_id,
        product_id: item?.product_id,
        quantity: item?.quantity,
      })),
      customer_id: order.customer_id,
    },
  })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
