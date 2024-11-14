import {
  uploadFilesWorkflow
} from "@medusajs/medusa/core-flows";
import {
  ExecArgs,
  MedusaContainer,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
  ProductStatus
} from "@medusajs/framework/utils";
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import mime from 'mime';

async function uploadLocalFiles(
  filePaths: string[],
  container: MedusaContainer,
  access: "private" | "public" = "private"
) {
  try {
    // Read all local files
    const files = await Promise.all(
      filePaths.map(async (filePath) => {
        const buffer = await readFile(filePath);
        const filename = path.basename(filePath);
        const mimeType = mime.lookup(filePath) || 'application/octet-stream';

        return {
          filename,
          mimeType,
          content: buffer.toString('binary'),
          access,
        };
      })
    );

    // Upload using Medusa workflow
    const { result } = await uploadFilesWorkflow(container).run({
      input: {
        files,
      },
    });

    return result;
  } catch (error) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      error.message
    );
  }
}


export default async function seedImages({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  // const remoteLink = container.resolve(
  //   ContainerRegistrationKeys.REMOTE_LINK
  // );
  // const query = container.resolve(ContainerRegistrationKeys.QUERY)
  // const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  // const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  // const storeModuleService = container.resolve(Modules.STORE);

  const filePaths = [
    '/var/www/seed-files/shorts-vintage-back.png',
    '/var/www/seed-files/shorts-vintage-back.png'
  ];

  try {
    const res = await uploadLocalFiles(filePaths, container);
    logger.info("Finished seeding images data.");
    logger.log({ res });
  } catch (error) {
    console.error("Error:", error);
  }


}
