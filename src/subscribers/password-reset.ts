import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { htmlEmail } from "../utils/email-template"

export default async function passwordResetHandler({
  event: {
    data: { entity_id: email, token, actor_type },
  },
  container,
}: SubscriberArgs<{ entity_id: string; token: string; actor_type: string }>) {
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const config = container.resolve("configModule")

  let urlPrefix = ""

  if (actor_type === "customer") {
    urlPrefix = config.admin.storefrontUrl || "http://localhost:8000"
  } else {
    const backendUrl =
      config.admin.backendUrl && config.admin.backendUrl !== "/"
        ? config.admin.backendUrl
        : "http://localhost:9000"
    const adminPath = config.admin.path || "/app"
    urlPrefix = `${backendUrl}${adminPath}`
  }

  const resetUrl = `${urlPrefix}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

  await notificationModuleService.createNotifications({
    to: email,
    channel: "email",
    template: "password-reset",
    content: {
      subject: "Reset your password",
      html: htmlEmail({
        title: "Reset your password",
        body: `<p>Use the link below to choose a new password. If you did not request this, you can ignore this email.</p>
<p><a href="${resetUrl}">Reset password</a></p>`,
      }),
    },
  })
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
