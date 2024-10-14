import config from '../configuration'
import { feathers } from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import authentication from '@feathersjs/authentication-client'

export const makeClient = (apiUrl) => {
  const client = feathers()
  const restClient = rest(apiUrl)
  client.configure(restClient.fetch(window.fetch.bind(window)))
  client.configure(authentication())
  return client
}

export const client = makeClient(config.apiBaseUrl)
