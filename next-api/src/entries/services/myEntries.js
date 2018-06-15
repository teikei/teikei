import { hooks as authHooks } from '@feathersjs/authentication/lib/index'

import Depot from '../../app/models/depots'
import Farm from '../../app/models/farms'
import Initiative from '../../app/models/initiatives'
import { wrapFeatureCollection } from '../hooks/geoJson'
import { restrictToUser } from '../../auth/hooks/authorization'

const columns = ['id', 'name', 'city', 'latitude', 'longitude']

const filterOwnedEntries = (entries, userId) =>
  entries.filter(e => e.ownerships.some(o => o.id === userId)).map(o => {
    delete o.ownerships
    return o
  })

export default app => {
  const service = {
    async find(params) {
      const userId = params.user && params.user.id

      const farms = await Farm.query()
        .eager('ownerships')
        .select(columns)
      const depots = await Depot.query()
        .eager('ownerships')
        .select(columns)
      const initiatives = await Initiative.query()
        .eager('ownerships')
        .select(columns)
      return filterOwnedEntries(
        farms.concat(depots).concat(initiatives),
        userId
      )
    }
  }

  app.use('/myentries', service)
  app.service('myentries').hooks({
    before: {
      all: [],
      find: [authHooks.authenticate('jwt'), restrictToUser],
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
