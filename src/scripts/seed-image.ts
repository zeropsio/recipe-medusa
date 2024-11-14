import { ExecArgs, FileDTO, MedusaContainer } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils';
import { uploadFilesWorkflow } from '@medusajs/medusa/core-flows';
import mime from 'mime';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export default async function seedImages({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  enum PRODUCTS {
    MedusaTShirt = "Medusa T-Shirt",
    MedusaSweatshirt = "Medusa Sweatshirt",
    MedusaSweatpants = "Medusa Sweatpants",
    MedusaShorts = "Medusa Shorts",
  };

  async function uploadLocalFiles(
    productImageMap: Record<string, string[]>,
    container: MedusaContainer,
    access: "private" | "public" = "private"
  ): Promise<Record<string, FileDTO[]>> {
    try {
      const results = {};

      for (const [productName, filePaths] of Object.entries(productImageMap)) {
        // Read all local files for this product
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

        results[productName] = result;
      }

      return results;
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        error.message
      );
    }
  }

  async function seedImages(container: MedusaContainer) {
    const productImageMap = {
      [PRODUCTS.MedusaTShirt]: [
        "/var/www/src/scripts/seed-files/tee-black-front.png",
        "/var/www/src/scripts/seed-files/tee-black-back.png",
        "/var/www/src/scripts/seed-files/tee-white-front.png",
        "/var/www/src/scripts/seed-files/tee-white-back.png"
      ],
      [PRODUCTS.MedusaSweatshirt]: [
        "/var/www/src/scripts/seed-files/sweatshirt-vintage-front.png",
        "/var/www/src/scripts/seed-files/sweatshirt-vintage-back.png"
      ],
      [PRODUCTS.MedusaSweatpants]: [
        "/var/www/src/scripts/seed-files/sweatpants-gray-front.png",
        "/var/www/src/scripts/seed-files/sweatpants-gray-back.png"
      ],
      [PRODUCTS.MedusaShorts]: [
        "/var/www/src/scripts/seed-files/shorts-vintage-front.png",
        "/var/www/src/scripts/seed-files/shorts-vintage-back.png"
      ],
    };

    try {
      return await uploadLocalFiles(productImageMap, container, "public");
    } catch (error) {
      console.error("Error:", error);
    }
  }

  logger.info("Seeding product images to S3.");

  const images = seedImages(container);

  logger.info(JSON.stringify(images));

  logger.info("After log");
}
