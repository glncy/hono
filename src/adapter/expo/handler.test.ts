import { Hono } from '../../hono'
import { handle, createMethodHandlers, handleExpoRequest } from './handler'

describe('Adapter for Expo API Routes', () => {
  let app: Hono

  beforeEach(() => {
    app = new Hono()
    app.get('/api/users/:id', (c) => {
      const id = c.req.param('id')
      return c.json({ id, name: `User ${id}` })
    })
    app.post('/api/users', async (c) => {
      const body = await c.req.json()
      return c.json({ success: true, user: body })
    })
    app.put('/api/users/:id', async (c) => {
      const id = c.req.param('id')
      const body = await c.req.json()
      return c.json({ id, updated: true, data: body })
    })
    app.delete('/api/users/:id', (c) => {
      const id = c.req.param('id')
      return c.json({ id, deleted: true })
    })
  })

  describe('handle function', () => {
    it('Should return an object with HTTP method handlers', () => {
      const handlers = handle(app)
      
      expect(handlers).toHaveProperty('GET')
      expect(handlers).toHaveProperty('POST')
      expect(handlers).toHaveProperty('PUT')
      expect(handlers).toHaveProperty('DELETE')
      expect(handlers).toHaveProperty('PATCH')
      expect(handlers).toHaveProperty('HEAD')
      expect(handlers).toHaveProperty('OPTIONS')
      
      expect(typeof handlers.GET).toBe('function')
      expect(typeof handlers.POST).toBe('function')
      expect(typeof handlers.PUT).toBe('function')
      expect(typeof handlers.DELETE).toBe('function')
    })

    it('Should handle GET requests correctly', async () => {
      const handlers = handle(app)
      const req = new Request('http://localhost/api/users/123')
      const res = await handlers.GET(req)
      
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({
        id: '123',
        name: 'User 123'
      })
    })

    it('Should handle POST requests correctly', async () => {
      const handlers = handle(app)
      const req = new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' })
      })
      const res = await handlers.POST(req)
      
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({
        success: true,
        user: { name: 'John Doe', email: 'john@example.com' }
      })
    })

    it('Should handle PUT requests correctly', async () => {
      const handlers = handle(app)
      const req = new Request('http://localhost/api/users/456', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Jane Doe' })
      })
      const res = await handlers.PUT(req)
      
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({
        id: '456',
        updated: true,
        data: { name: 'Jane Doe' }
      })
    })

    it('Should handle DELETE requests correctly', async () => {
      const handlers = handle(app)
      const req = new Request('http://localhost/api/users/789', {
        method: 'DELETE'
      })
      const res = await handlers.DELETE(req)
      
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({
        id: '789',
        deleted: true
      })
    })
  })

  describe('createMethodHandlers function', () => {
    it('Should return an object with HTTP method handlers', () => {
      const handlers = createMethodHandlers(app)
      
      expect(handlers).toHaveProperty('GET')
      expect(handlers).toHaveProperty('POST')
      expect(handlers).toHaveProperty('PUT')
      expect(handlers).toHaveProperty('DELETE')
      expect(handlers).toHaveProperty('PATCH')
      expect(handlers).toHaveProperty('HEAD')
      expect(handlers).toHaveProperty('OPTIONS')
      
      expect(typeof handlers.GET).toBe('function')
      expect(typeof handlers.POST).toBe('function')
    })

    it('Should handle requests correctly', async () => {
      const handlers = createMethodHandlers(app)
      const req = new Request('http://localhost/api/users/999')
      const res = await handlers.GET(req)
      
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({
        id: '999',
        name: 'User 999'
      })
    })
  })

  describe('handleExpoRequest function', () => {
    it('Should return a function that handles requests', () => {
      const handler = handleExpoRequest(app)
      expect(typeof handler).toBe('function')
    })

    it('Should handle requests correctly', async () => {
      const handler = handleExpoRequest(app)
      const req = new Request('http://localhost/api/users/777')
      const res = await handler(req)
      
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({
        id: '777',
        name: 'User 777'
      })
    })

    it('Should handle POST requests correctly', async () => {
      const handler = handleExpoRequest(app)
      const req = new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test User' })
      })
      const res = await handler(req)
      
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({
        success: true,
        user: { name: 'Test User' }
      })
    })
  })

  describe('Error handling', () => {
    it('Should handle errors correctly', async () => {
      const errorApp = new Hono()
      errorApp.get('/error', () => {
        throw new Error('Test error')
      })

      const handlers = handle(errorApp)
      const req = new Request('http://localhost/error')
      const res = await handlers.GET(req)
      
      expect(res.status).toBe(500)
    })

    it('Should handle 404 errors correctly', async () => {
      const handlers = handle(app)
      const req = new Request('http://localhost/nonexistent')
      const res = await handlers.GET(req)
      
      expect(res.status).toBe(404)
    })
  })

  describe('Middleware support', () => {
    it('Should work with middleware', async () => {
      type Env = {
        Variables: {
          middleware: string
        }
      }
      
      const middlewareApp = new Hono<Env>()
      
      middlewareApp.use('*', async (c, next) => {
        c.set('middleware', 'executed')
        await next()
      })
      
      middlewareApp.get('/test', (c) => {
        const middleware = c.get('middleware')
        return c.json({ middleware })
      })

      const handlers = handle(middlewareApp)
      const req = new Request('http://localhost/test')
      const res = await handlers.GET(req)
      
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({
        middleware: 'executed'
      })
    })
  })
})