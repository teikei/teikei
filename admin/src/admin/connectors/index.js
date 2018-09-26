import {
  createFrontendConnector,
  createBackendConnector
} from '@crudlio/crudl-connectors-base'
import {
  crudToHttp,
  url,
  transformData
} from '@crudlio/crudl-connectors-base/lib/middleware'

import crudlErrors from './middleware/crudlErrors'
import numberedPagination from './middleware/numberedPagination'
import buildQuery from './middleware/buildQuery'

const baseURL = process.env.REACT_APP_API_URL

export const createFeathersConnector = urlPath =>
  createFrontendConnector(createBackendConnector({ baseURL }))
    .use(buildQuery())
    .use(crudToHttp())
    .use(url(urlPath))
    .use(crudlErrors)

export const list = createFeathersConnector('/admin/:collection/').use(
  numberedPagination
)

export const detail = createFeathersConnector('/admin/:collection/:id/')

export const options = (collection, valueKey, labelKey) =>
  list(collection).use(next => ({
    read: req =>
      next.read(req.filter('$limit', 1000000)).then(res =>
        Object.assign(res, {
          data: {
            options: res.data.map(item => ({
              value: item[valueKey],
              label: item[labelKey]
            }))
          }
        })
      )
  }))

export const login = createFeathersConnector('authentication/').use(
  transformData('create', data => ({
    requestHeaders: { Authorization: data.accessToken },
    info: { username: data.user.name, abilities: data.abilities }
  }))
)
