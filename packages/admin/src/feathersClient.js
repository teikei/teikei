import feathers from 'feathers-client'
import superagent from 'superagent'

const client = feathers()
client.configure(feathers.hooks())
client.configure(
  feathers.rest(import.meta.env.VITE_API_URL).superagent(superagent),
)
client.configure(
  feathers.authentication({
    storage: window.localStorage,
  }),
)

export default client
