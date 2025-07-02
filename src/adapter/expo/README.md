# Expo API Routes Adapter

This adapter allows you to use Hono with [Expo API Routes](https://docs.expo.dev/router/reference/api-routes/).

## Installation

```bash
npm install hono
```

## Usage

### Basic Usage

Create an API route file in your Expo project (e.g., `app/api/hello+api.ts`):

```typescript
import { Hono } from 'hono'
import { handle } from 'hono/expo'

const app = new Hono()

app.get('/', (c) => {
  return c.json({ message: 'Hello from Hono + Expo!' })
})

app.post('/', async (c) => {
  const body = await c.req.json()
  return c.json({ received: body })
})

// Export the HTTP method handlers that Expo expects
export const { GET, POST } = handle(app)
```

### Selective Method Export

If you only want to export specific HTTP methods:

```typescript
import { Hono } from 'hono'
import { createMethodHandlers } from 'hono/expo'

const app = new Hono()

app.get('/', (c) => c.json({ users: [] }))
app.post('/', async (c) => {
  const user = await c.req.json()
  return c.json({ created: user })
})

const handlers = createMethodHandlers(app)

// Only export the methods you need
export const GET = handlers.GET
export const POST = handlers.POST
```

### Single Handler

For simple use cases where you want a single handler function:

```typescript
import { Hono } from 'hono'
import { handleExpoRequest } from 'hono/expo'

const app = new Hono()
app.get('/', (c) => c.json({ message: 'Hello!' }))

const handler = handleExpoRequest(app)
export const GET = handler
```

## Features

- ✅ All HTTP methods supported (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)
- ✅ Full Hono middleware support
- ✅ Type-safe with TypeScript
- ✅ Compatible with all Hono features (routing, validation, etc.)
- ✅ Works with Expo Router file-based routing

## API Reference

### `handle(app: Hono)`

Returns an object containing all HTTP method handlers that Expo Router expects.

**Returns:** `{ GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS }`

### `createMethodHandlers(app: Hono)`

Similar to `handle()` but allows you to selectively export methods.

**Returns:** `{ GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS }`

### `handleExpoRequest(app: Hono)`

Returns a single request handler function.

**Returns:** `(req: Request) => Response | Promise<Response>`