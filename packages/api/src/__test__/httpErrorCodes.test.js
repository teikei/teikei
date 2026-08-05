import express from 'express'
import { logger } from '../logger'
import serverErrorHandler from '../middleware/errorHandler'
import rateLimiting from '../middleware/rateLimit'
import { errorCodes } from '../utils/errorCodes'

// These surfaces never reach a Feathers service, so they are exercised over real
// HTTP rather than by calling a hook.
const withServer = async (buildApp, run) => {
  const server = buildApp().listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  try {
    return await run(`http://127.0.0.1:${server.address().port}`)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}

const postSignIn = (baseUrl) =>
  fetch(`${baseUrl}/authentication`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ strategy: 'local', email: 'a@b.c', password: 'x' })
  })

describe('rate limit responses', () => {
  const buildRateLimitedApp = () => {
    const app = express()
    app.use(express.json())
    app.set('rateLimit', {
      enabled: true,
      auth: { windowMs: 60000, max: 1 },
      passwordReset: { windowMs: 60000, max: 1 },
      register: { windowMs: 60000, max: 1 },
      contact: { windowMs: 60000, max: 1 }
    })
    rateLimiting(app)
    // Stands in for the authentication service; a failed sign-in is what the
    // auth limiter counts (it skips successful requests).
    app.post('/authentication', (req, res) => res.status(401).json({}))
    return app
  }

  it('answers a throttled request with a coded JSON body', async () => {
    await withServer(buildRateLimitedApp, async (baseUrl) => {
      await postSignIn(baseUrl)
      const response = await postSignIn(baseUrl)

      expect(response.status).toBe(429)
      expect(response.headers.get('content-type')).toContain('application/json')
      expect(await response.json()).toEqual({
        name: 'TooManyRequests',
        message: 'Too many requests, please try again later.',
        code: 429,
        className: 'too-many-requests',
        data: { errorCode: errorCodes.RATE_LIMITED }
      })
    })
  })

  it('lets a request under the limit through', async () => {
    await withServer(buildRateLimitedApp, async (baseUrl) => {
      expect((await postSignIn(baseUrl)).status).toBe(401)
    })
  })
})

describe('unexpected server errors', () => {
  const buildThrowingApp = () => {
    const app = express()
    app.get('/boom', (req, res, next) => {
      next(new Error('missing html template for password_reset'))
    })
    app.use(serverErrorHandler())
    return app
  }

  it('codes a 500 as SERVER_ERROR', async () => {
    await withServer(buildThrowingApp, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/boom`, {
        headers: { Accept: 'application/json' }
      })

      expect(response.status).toBe(500)
      expect(response.headers.get('content-type')).toContain('application/json')

      const body = await response.json()
      expect(body.code).toBe(500)
      expect(body.data.errorCode).toBe(errorCodes.SERVER_ERROR)
    })
  })

  it('still logs the raw message server-side', async () => {
    const logged = vi.spyOn(logger, 'error').mockImplementation(() => {})

    await withServer(buildThrowingApp, async (baseUrl) => {
      await fetch(`${baseUrl}/boom`, {
        headers: { Accept: 'application/json' }
      })
    })

    expect(
      logged.mock.calls.flat().some((arg) => {
        const text = arg instanceof Error ? arg.message : String(arg)
        return text.includes('missing html template for password_reset')
      })
    ).toBe(true)
  })
})
