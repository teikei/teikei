import config from '~/configuration'
import authentication from '@feathersjs/authentication-client'
import { feathers } from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import type { KyResponse } from 'ky'

import type { ErrorResponse } from '~/types/types'

const isBrowser = typeof window !== 'undefined'

export const makeClient = (apiUrl: string) => {
  const client = feathers()
  const restClient = rest(apiUrl)
  if (!isBrowser) {
    throw new Error('makeClient must be called in a browser environment')
  }
  client.configure(restClient.fetch(window.fetch.bind(window)))
  client.configure(authentication())
  return client
}

const browserClient = isBrowser ? makeClient(config.apiBaseUrl) : undefined

export const getClient = () => {
  if (!browserClient) {
    throw new Error('Feathers client is only available in the browser')
  }
  return browserClient
}

export class ApiResponseError extends Error {
  code?: number
  constructor(message: string, code?: number) {
    super(message)
    this.code = code
  }
}

type KyErrorResponse = { response: KyResponse }

export async function throwApiError(error: unknown) {
  const { message, code } = (await (
    error as KyErrorResponse
  ).response.json()) as ErrorResponse
  throw new ApiResponseError(message, code)
}
