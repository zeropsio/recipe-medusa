import {
  loadEnv,
  defineConfig,
  Modules,
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

/** Empty or whitespace-only secrets stay off — Zerops may inject "". */
const envEnabled = (value: string | undefined) => Boolean(value?.trim())

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"
const CACHE_REDIS_URL = process.env.CACHE_REDIS_URL || REDIS_URL
const EVENTS_REDIS_URL = process.env.EVENTS_REDIS_URL || REDIS_URL
const WE_REDIS_URL = process.env.WE_REDIS_URL || REDIS_URL
const LOCKING_REDIS_URL = process.env.LOCKING_REDIS_URL || REDIS_URL

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || ""
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || ""
const BACKEND_URL = process.env.BACKEND_URL || ""
const STOREFRONT_URL = process.env.STOREFRONT_URL || process.env.NEXT_STORE_URL || ""

const SMTP_HOST = process.env.SMTP_HOST
const emailNotificationProvider = SMTP_HOST
  ? {
      resolve: "./src/modules/smtp-notification",
      id: "smtp",
      options: {
        channels: ["email"],
        host: SMTP_HOST,
        port: Number(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
      },
    }
  : {
      resolve: "@medusajs/medusa/notification-local",
      id: "local-email",
      options: {
        name: "Local Email Notification Provider",
        channels: ["email"],
      },
    }

const modules: Record<string, unknown>[] = [
  {
    resolve: "@medusajs/medusa/caching",
    options: {
      providers: [
        {
          resolve: "@medusajs/caching-redis",
          id: "caching-redis",
          is_default: true,
          options: {
            redisUrl: CACHE_REDIS_URL,
          },
        },
      ],
    },
  },
  {
    resolve: "@medusajs/medusa/event-bus-redis",
    options: {
      redisUrl: EVENTS_REDIS_URL,
      jobOptions: {
        removeOnComplete: {
          age: 3600,
          count: 1000,
        },
        removeOnFail: {
          age: 3600,
          count: 1000,
        },
      },
    },
  },
  {
    resolve: "@medusajs/medusa/workflow-engine-redis",
    options: {
      redis: {
        redisUrl: WE_REDIS_URL,
      },
    },
  },
  {
    resolve: "@medusajs/medusa/locking",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/locking-redis",
          id: "locking-redis",
          is_default: true,
          options: {
            redisUrl: LOCKING_REDIS_URL,
          },
        },
      ],
    },
  },
  {
    resolve: "@medusajs/medusa/notification",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/notification-local",
          id: "local",
          options: {
            name: "Local Notification Provider",
            channels: ["feed"],
          },
        },
        emailNotificationProvider,
      ],
    },
  },
  {
    resolve: "./src/modules/meilisearch",
    options: {
      host: MEILISEARCH_HOST,
      apiKey: MEILISEARCH_API_KEY,
      productIndexName: process.env.MEILISEARCH_PRODUCT_INDEX_NAME || "products",
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
            file_url:
              process.env.MINIO_ENDPOINT + "/" + process.env.MINIO_BUCKET,
            access_key_id: process.env.MINIO_ACCESS_KEY,
            secret_access_key: process.env.MINIO_SECRET_KEY,
            region: "us-east-1",
            bucket: process.env.MINIO_BUCKET,
            endpoint: process.env.MINIO_ENDPOINT,
            additional_client_config: {
              forcePathStyle: true,
            },
          },
        },
      ],
    },
  },
  {
    resolve: "@medusajs/medusa/translation",
  },
  {
    resolve: "@medusajs/medusa/analytics",
    options: {
      providers: [
        envEnabled(process.env.POSTHOG_EVENTS_API_KEY)
          ? {
              resolve: "@medusajs/medusa/analytics-posthog",
              id: "posthog",
              options: {
                posthogEventsKey: process.env.POSTHOG_EVENTS_API_KEY,
                posthogHost: process.env.POSTHOG_HOST || "https://eu.i.posthog.com",
              },
            }
          : {
              resolve: "@medusajs/medusa/analytics-local",
              id: "local",
            },
      ],
    },
  },
]

if (envEnabled(process.env.STRIPE_API_KEY)) {
  modules.push({
    resolve: "@medusajs/medusa/payment",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/payment-stripe",
          id: "stripe",
          options: {
            apiKey: process.env.STRIPE_API_KEY,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
          },
        },
      ],
    },
  })
}

const authProviders: Record<string, unknown>[] = [
  {
    resolve: "@medusajs/medusa/auth-emailpass",
    id: "emailpass",
  },
]

if (envEnabled(process.env.GOOGLE_CLIENT_ID) && envEnabled(process.env.GOOGLE_CLIENT_SECRET)) {
  authProviders.push({
    resolve: "@medusajs/medusa/auth-google",
    id: "google",
    options: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl:
        process.env.GOOGLE_CALLBACK_URL ||
        `${STOREFRONT_URL}/auth/google/callback`,
    },
  })
}

if (envEnabled(process.env.GITHUB_CLIENT_ID) && envEnabled(process.env.GITHUB_CLIENT_SECRET)) {
  authProviders.push({
    resolve: "@medusajs/medusa/auth-github",
    id: "github",
    options: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackUrl:
        process.env.GITHUB_CALLBACK_URL ||
        `${STOREFRONT_URL}/auth/github/callback`,
    },
  })
}

if (authProviders.length > 1) {
  modules.push({
    resolve: "@medusajs/medusa/auth",
    dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER],
    options: {
      providers: authProviders,
    },
  })
}

module.exports = defineConfig({
  admin: {
    backendUrl: BACKEND_URL,
    storefrontUrl: STOREFRONT_URL,
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
    redisUrl: REDIS_URL,
  },
  featureFlags: {
    caching: true,
    translation: true,
  },
  plugins: [
    {
      resolve: "@medusajs/draft-order",
      options: {},
    },
  ],
  modules,
})
