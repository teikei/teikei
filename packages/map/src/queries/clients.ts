import AuthManagement from 'feathers-authentication-management/src/client'
import config from '../configuration'
import feathers from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import superagent from 'superagent'
import authentication from '@feathersjs/authentication-client'

export const makeClient = (apiUrl) => {
  const client = feathers()
  const restClient = rest(apiUrl).superagent(superagent)
  client.configure(restClient)
  client.configure(
    authentication({
      storage: window.localStorage
    })
  )
  return client
}

export const client = makeClient(config.apiBaseUrl)
export const authManagement = new AuthManagement(client)
