import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"
import nodemailer, { Transporter } from "nodemailer"

type InjectedDependencies = {
  logger: Logger
}

type SmtpOptions = {
  host: string
  port?: number
  secure?: boolean
  user?: string
  pass?: string
  from?: string
}

class SmtpNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "smtp-notification"

  protected logger_: Logger
  protected options_: SmtpOptions
  protected transporter_: Transporter

  constructor({ logger }: InjectedDependencies, options: SmtpOptions) {
    super()

    this.logger_ = logger
    this.options_ = options
    this.transporter_ = nodemailer.createTransport({
      host: options.host,
      port: options.port ?? 587,
      secure: options.secure ?? false,
      auth:
        options.user && options.pass
          ? {
              user: options.user,
              pass: options.pass,
            }
          : undefined,
    })
  }

  static validateOptions(options: Record<any, any>) {
    if (!options.host) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "SMTP host is required in the provider's options."
      )
    }
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const from = notification.from || this.options_.from
    const subject =
      notification.content?.subject || `Notification: ${notification.template}`
    const html =
      notification.content?.html ||
      `<p>${JSON.stringify(notification.data ?? {}, null, 2)}</p>`
    const text = notification.content?.text

    const info = await this.transporter_.sendMail({
      from,
      to: notification.to,
      subject,
      html,
      text,
      attachments: notification.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.content_type,
        cid: attachment.id || undefined,
      })),
    })

    this.logger_.info(
      `SMTP notification sent template=${notification.template} to=${notification.to}`
    )

    return {
      id: typeof info.messageId === "string" ? info.messageId : undefined,
    }
  }
}

export default SmtpNotificationProviderService
