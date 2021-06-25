import feathers from 'feathers-client'
import superagent from 'superagent'

const apiUrl = 'http://localhost:3030'

const client = feathers()
client.configure(feathers.hooks())
client.configure(feathers.rest(apiUrl).superagent(superagent))
client.configure(
  feathers.authentication({
    storage: window.localStorage,
  })
)

export default client
