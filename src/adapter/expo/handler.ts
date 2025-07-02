/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Hono } from '../../hono'

/**
 * Handle function for Expo API Routes
 * Creates an object with HTTP method functions that Expo Router expects
 * 
 * @example
 * ```ts
 * // app/api/hello+api.ts
 * import { Hono } from 'hono'
 * import { handle } from 'hono/expo'
 * 
 * const app = new Hono()
 * 
 * app.get('/', (c) => {
 *   return c.json({ message: 'Hello, Expo!' })
 * })
 * 
 * app.post('/', async (c) => {
 *   const body = await c.req.json()
 *   return c.json({ received: body })
 * })
 * 
 * export const { GET, POST } = handle(app)
 * ```
 */
export const handle = (app: Hono<any, any, any>) => {
  const handler = (req: Request): Response | Promise<Response> => {
    return app.fetch(req)
  }

  return {
    GET: handler,
    POST: handler,
    PUT: handler,
    DELETE: handler,
    PATCH: handler,
    HEAD: handler,
    OPTIONS: handler,
  }
}

/**
 * Create individual method handlers for more granular control
 * Useful when you want to export only specific HTTP methods
 * 
 * @example
 * ```ts
 * // app/api/users+api.ts
 * import { Hono } from 'hono'
 * import { createMethodHandlers } from 'hono/expo'
 * 
 * const app = new Hono()
 * 
 * app.get('/', (c) => c.json({ users: [] }))
 * app.post('/', async (c) => {
 *   const user = await c.req.json()
 *   return c.json({ created: user })
 * })
 * 
 * const handlers = createMethodHandlers(app)
 * export const GET = handlers.GET
 * export const POST = handlers.POST
 * ```
 */
export const createMethodHandlers = (app: Hono<any, any, any>) => {
  const baseHandler = (req: Request): Response | Promise<Response> => {
    return app.fetch(req)
  }

  return {
    GET: (req: Request) => baseHandler(req),
    POST: (req: Request) => baseHandler(req),
    PUT: (req: Request) => baseHandler(req),
    DELETE: (req: Request) => baseHandler(req),
    PATCH: (req: Request) => baseHandler(req),
    HEAD: (req: Request) => baseHandler(req),
    OPTIONS: (req: Request) => baseHandler(req),
  }
}

/**
 * Simple handle function similar to Vercel adapter
 * For cases where you want a single handler function
 * 
 * @example
 * ```ts
 * // For custom routing or single method APIs
 * import { Hono } from 'hono'
 * import { handleExpoRequest } from 'hono/expo'
 * 
 * const app = new Hono()
 * app.get('/', (c) => c.json({ message: 'Hello!' }))
 * 
 * const handler = handleExpoRequest(app)
 * export const GET = handler
 * ```
 */
export const handleExpoRequest =
  (app: Hono<any, any, any>) =>
  (req: Request): Response | Promise<Response> => {
    return app.fetch(req)
  }