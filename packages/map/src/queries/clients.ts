import authentication from '@feathersjs/authentication-client'
import { feathers } from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import ky, { Options } from 'ky'
import config from '../configuration'
import { ErrorResponse } from '../types/types.ts'

export const makeClient = (apiUrl) => {
  const client = feathers()
  const restClient = rest(apiUrl)
  client.configure(restClient.fetch(window.fetch.bind(window)))
  client.configure(authentication())
  return client
}

export const client = makeClient(config.apiBaseUrl)

export class ApiResponseError extends Error {
  code?: number
  constructor(message: string, code?: number) {
    super(message)
    this.code = code
  }
}

/**
 * POSTs JSON to the API and returns the parsed body, reading the response body
 * exactly once. ky's `.json()` shortcut consumes the body when it throws on a
 * non-2xx status, so the previous pattern (`ky.post(...).json()` then reading
 * `error.response.json()` in the catch) failed with "body stream already read"
 * and masked the real server error. `throwHttpErrors: false` lets us read the
 * body once and surface the server's message.
 */
export async function postJson<T = unknown>(
  url: string,
  options: Options = {}
): Promise<T | undefined> {
  const response = await ky.post(url, { ...options, throwHttpErrors: false })

  let body: (ErrorResponse & Record<string, unknown>) | undefined
  try {
    body = await response.json()
  } catch {
    // No JSON body (e.g. empty 2xx response).
    body = undefined
  }

  if (!response.ok) {
    throw new ApiResponseError(
      body?.message ?? 'Request failed',
      body?.code ?? response.status
    )
  }

  return body as T | undefined
}
