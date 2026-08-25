import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { htmlEmail } from "../utils/email-template"

export default async function customerCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [customer] } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "first_name"],
    filters: { id: data.id },
  })

  if (!customer?.email) {
    return
  }

  const name = customer.first_name ? ` ${customer.first_name}` : ""

  await notificationModuleService.createNotifications({
    to: customer.email,
    channel: "email",
    template: "customer-created",
    content: {
      subject: "Welcome to the store",
      html: htmlEmail({
        title: `Welcome${name}`,
        body: "<p>Your customer account is ready. You can now sign in, browse products, and place orders.</p>",
      }),
    },
  })
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
