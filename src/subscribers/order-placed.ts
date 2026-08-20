import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { htmlEmail } from "../utils/email-template"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [order] } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "email", "total", "currency_code"],
    filters: { id: data.id },
  })

  if (!order?.email) {
    return
  }

  await notificationModuleService.createNotifications({
    to: order.email,
    channel: "email",
    template: "order-confirmation",
    content: {
      subject: `Order #${order.display_id ?? order.id} confirmed`,
      html: htmlEmail({
        title: "Thanks for your order",
        body: `<p>Your order <strong>#${order.display_id ?? order.id}</strong> has been placed.</p>
<p>Total: ${order.total ?? ""} ${order.currency_code ?? ""}</p>`,
      }),
    },
  })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
