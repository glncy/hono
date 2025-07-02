import { Hono } from '../../hono'
import { handle } from './handler'

describe('Expo API Routes Integration Demo', () => {
  it('Should work like a real Expo API route', async () => {
    // This simulates how a developer would use the adapter in their Expo app
    
    // 1. Create a Hono app for the API route
    const app = new Hono()
    
    // 2. Define routes like they would in a normal Hono app
    app.get('/', (c) => {
      return c.json({ 
        message: 'Welcome to Expo + Hono API!',
        timestamp: new Date().toISOString(),
        method: 'GET'
      })
    })
    
    app.post('/', async (c) => {
      const body = await c.req.json()
      return c.json({ 
        message: 'Data received successfully',
        data: body,
        method: 'POST'
      })
    })
    
    app.get('/users/:id', (c) => {
      const id = c.req.param('id')
      return c.json({
        user: {
          id,
          name: `User ${id}`,
          email: `user${id}@example.com`
        }
      })
    })
    
    // 3. Export the handlers that Expo expects
    const { GET, POST } = handle(app)
    
    // 4. Test that the exported handlers work correctly
    
    // Test GET request
    const getReq = new Request('http://localhost/')
    const getRes = await GET(getReq)
    const getData = await getRes.json()
    
    expect(getRes.status).toBe(200)
    expect(getData.message).toBe('Welcome to Expo + Hono API!')
    expect(getData.method).toBe('GET')
    expect(getData.timestamp).toBeDefined()
    
    // Test POST request
    const postReq = new Request('http://localhost/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'johndoe', action: 'create' })
    })
    const postRes = await POST(postReq)
    const postData = await postRes.json()
    
    expect(postRes.status).toBe(200)
    expect(postData.message).toBe('Data received successfully')
    expect(postData.method).toBe('POST')
    expect(postData.data).toEqual({ username: 'johndoe', action: 'create' })
    
    // Test parameterized route
    const userReq = new Request('http://localhost/users/123')
    const userRes = await GET(userReq)
    const userData = await userRes.json()
    
    expect(userRes.status).toBe(200)
    expect(userData.user.id).toBe('123')
    expect(userData.user.name).toBe('User 123')
    expect(userData.user.email).toBe('user123@example.com')
  })

  it('Should work with middleware like a real Expo app', async () => {
    const app = new Hono()
    
    // Add CORS middleware (common in mobile API development)
    app.use('*', async (c, next) => {
      await next()
      c.res.headers.set('Access-Control-Allow-Origin', '*')
      c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
      c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    })
    
    // Add request logging middleware
    app.use('*', async (c, next) => {
      const start = Date.now()
      await next()
      const ms = Date.now() - start
      c.res.headers.set('X-Response-Time', `${ms}ms`)
    })
    
    app.get('/api/data', (c) => {
      return c.json({ data: 'This is API data' })
    })
    
    const { GET } = handle(app)
    
    const req = new Request('http://localhost/api/data')
    const res = await GET(req)
    const data = await res.json()
    
    expect(res.status).toBe(200)
    expect(data.data).toBe('This is API data')
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE')
    expect(res.headers.get('X-Response-Time')).toMatch(/\d+ms/)
  })
})