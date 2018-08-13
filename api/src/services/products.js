import Depot from '../models/depots'
import Farm from '../models/farms'
import Initiative from '../models/initiatives'
import wrapFeatureCollection from '../hooks/geoJson'
import createService from 'feathers-objection/lib'
import Product from '../models/products'

const qualify = (model, attribute) =>
  model ? `${model}.${attribute}` : attribute

export const entryColumns = model => [
  qualify(model, 'id'),
  'name',
  'city',
  'latitude',
  'longitude'
]

export default app => {
  const service = createService({
    model: Product
  })

  app.use('/products', service)
  app.service('products').hooks({
    before: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    },

    after: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    },

    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    }
  })
}
