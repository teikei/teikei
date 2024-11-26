import authentication from '@feathersjs/authentication-client'
import { feathers } from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import { KyResponse } from 'ky'
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

type KyErrorResponse = { response: KyResponse }

export async function throwApiError(error: unknown) {
  const { message, code } = (await (
    error as KyErrorResponse
  ).response.json()) as ErrorResponse
  throw new ApiResponseError(message, code)
}
