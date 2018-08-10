import Depot from '../models/depots'
import Farm from '../models/farms'
import Initiative from '../models/initiatives'
import wrapFeatureCollection from '../hooks/geoJson'

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
  const service = {
    async find() {
      const farms = await Farm.query()
        .eager('products')
        .modifyEager('products', b => b.select(['category', 'name']))
        .select(entryColumns())
      const depots = await Depot.query().select(entryColumns())
      const initiatives = await Initiative.query().select(entryColumns())
      return farms.concat(depots).concat(initiatives)
    }
  }

  app.use('/entries', service)
  app.service('entries').hooks({
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
      find: [wrapFeatureCollection],
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
