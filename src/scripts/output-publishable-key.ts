import {
  ExecArgs,
  IApiKeyModuleService
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function myScript({ container }: ExecArgs) {
  const service = container.resolve<IApiKeyModuleService>(Modules.API_KEY)
  const data = (await service.listApiKeys()).at(0);

  process.stdout.write(`<PK_TOKEN>${data.token}</PK_TOKEN>`);
}
