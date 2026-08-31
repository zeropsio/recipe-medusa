import {
  defineMiddlewares,
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from "@medusajs/framework/http"

/**
 * Medusa sets secure session cookies in production. Behind Zerops (and other
 * reverse proxies) the app must see HTTPS via X-Forwarded-Proto or admin login
 * succeeds but /admin/users/me returns 401.
 * @see https://github.com/medusajs/medusa/issues/14550
 */
const forceHttpsProtocol = (
  req: MedusaRequest,
  _res: MedusaResponse,
  next: MedusaNextFunction
) => {
  if (process.env.NODE_ENV === "production") {
    Object.defineProperty(req, "protocol", {
      get: () => "https",
      configurable: true,
    })
    req.headers["x-forwarded-proto"] = "https"
  }

  next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/*",
      middlewares: [forceHttpsProtocol],
    },
  ],
})
