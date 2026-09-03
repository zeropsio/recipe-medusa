import {
  ExecArgs,
  IApiKeyModuleService
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function myScript({ container }: ExecArgs) {
  const service = container.resolve<IApiKeyModuleService>(Modules.API_KEY)
  const apiKeys = await service.listApiKeys()
  const publishableKey =
    apiKeys.find((key) => key.type === "publishable") ?? apiKeys.at(0)

  if (!publishableKey?.token) {
    throw new Error("No publishable API key found. Run seed first.")
  }

  process.stdout.write(`<PK_TOKEN>${publishableKey.token}</PK_TOKEN>`)
}
