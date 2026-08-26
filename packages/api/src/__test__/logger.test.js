import { AxiosError } from 'axios'
import { redactSecrets } from '../logger.js'

const transform = (info) => redactSecrets().transform(info)

const postmarkConfig = {
  method: 'get',
  url: 'https://api.postmarkapp.com/message-streams/broadcast/suppressions/dump',
  headers: { Accept: 'application/json', 'X-Postmark-Server-Token': 'secret' }
}

const hereConfig = {
  method: 'get',
  url: 'https://geocode.search.hereapi.com/v1/geocode',
  params: { q: 'Berlin', apikey: 'secret' }
}

const axiosError = (config, response) =>
  new AxiosError(
    'Request failed with status code 500',
    'ERR_BAD_RESPONSE',
    config,
    {},
    response
  )

describe('redactSecrets', () => {
  it('redacts credential headers on an axios error logged as metadata', () => {
    const info = transform({
      level: 'error',
      message: 'boom',
      error: axiosError(postmarkConfig)
    })

    expect(info.error.config.headers['X-Postmark-Server-Token']).toBe(
      '[REDACTED]'
    )
    expect(info.error.config.headers.Accept).toBe('application/json')
    expect(info.error.config.url).toBe(postmarkConfig.url)
  })

  it('redacts credentials passed as query parameters', () => {
    const info = transform({
      level: 'error',
      message: 'boom',
      error: axiosError(hereConfig)
    })

    expect(info.error.config.params).toEqual({
      q: 'Berlin',
      apikey: '[REDACTED]'
    })
  })

  it('redacts the config that format.errors() spreads onto info', () => {
    const info = transform({
      level: 'error',
      message: 'boom',
      config: postmarkConfig,
      request: { circular: 'and huge' },
      response: {
        status: 500,
        statusText: 'Internal Server Error',
        data: { Message: 'boom' }
      }
    })

    expect(info.config.headers['X-Postmark-Server-Token']).toBe('[REDACTED]')
    expect(info.response.status).toBe(500)
    expect(info).not.toHaveProperty('request')
  })

  it('serializes a plain error, which JSON.stringify would render as {}', () => {
    const info = transform({
      level: 'error',
      message: 'boom',
      error: new Error('nope')
    })

    expect(info.error.name).toBe('Error')
    expect(info.error.message).toBe('nope')
    expect(info.error.stack).toContain('nope')
  })

  it('survives the circular references axios hangs off its errors', () => {
    const config = { ...postmarkConfig }
    config.self = config

    expect(() =>
      transform({ level: 'error', error: axiosError(config) })
    ).not.toThrow()
  })

  it('leaves a non-axios `config` field alone', () => {
    const info = transform({
      level: 'info',
      message: 'starting',
      config: { port: 3030 },
      request: 'not an http.ClientRequest'
    })

    expect(info.request).toBe('not an http.ClientRequest')
  })

  it('leaves ordinary log entries alone', () => {
    const info = transform({
      level: 'info',
      message: 'CRON: import email bounces - starting'
    })

    expect(info).toEqual({
      level: 'info',
      message: 'CRON: import email bounces - starting'
    })
  })
})
