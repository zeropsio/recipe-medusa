import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const BACKEND_URL = process.env.BACKEND_URL || "";

module.exports = defineConfig({
  admin: {
    backendUrl: BACKEND_URL,
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    databaseDriverOptions: {
      connection: {
        ssl: {
          rejectUnauthorized: false
        }
      }
    },
    redisUrl: REDIS_URL,
  },
  modules: [
    {
      resolve: "@medusajs/medusa/cache-redis",
      options: {
        redisUrl: process.env.CACHE_REDIS_URL,
      },
    },
    {
      resolve: "@medusajs/event-bus-redis",
      key: 'event-bus-redis',
      options: {
        redisUrl: process.env.EVENTS_REDIS_URL,
      },
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: process.env.MINIO_ENDPOINT + '/' + process.env.MINIO_BUCKET,
              access_key_id: process.env.MINIO_ACCESS_KEY,
              secret_access_key: process.env.MINIO_SECRET_KEY,
              region: 'us-east-1',
              bucket: process.env.MINIO_BUCKET,
              endpoint: process.env.MINIO_ENDPOINT,
              additional_client_config: {
                forcePathStyle: true
              }
            },
          },
        ],
      },
    },
    {
      resolve: `medusa-plugin-meilisearch`,
      options: {
        config: {
          host: process.env.MEILISEARCH_HOST,
          apiKey: process.env.MEILISEARCH_API_KEY,
        },
        settings: {
          products: {
            indexSettings: {
              searchableAttributes: [
                "title",
                "description",
                "variant_sku",
              ],
              displayedAttributes: [
                "title",
                "description",
                "variant_sku",
                "thumbnail",
                "handle",
              ],
            },
            primaryKey: "id",
            // transformer: (product) => ({
            //   id: product.id,
            //   // other attributes...
            // }),
          },
        },
      },
    },
  ]
})
