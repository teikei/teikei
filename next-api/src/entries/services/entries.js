import fp from 'lodash/fp'
import authentication from '@feathersjs/authentication/lib/index'
import { iff } from 'feathers-hooks-common'

import Depot from '../../app/models/depots'
import Farm from '../../app/models/farms'
import Initiative from '../../app/models/initiatives'
import { featureCollection } from '../../app/util/jsonUtils'

const columns = ['id', 'name', 'city', 'latitude', 'longitude']

const filterOwnedEntries = (entries, userId) =>
  entries
    .filter(e => e.ownerships.some(o => o.id === userId))
    .map(fp.omit('ownerships'))

export default app => {
  const service = {
    async find(params) {
      if (params.query.filter === 'mine' && params.user) {
        const farms = await Farm.query()
          .eager('ownerships')
          .select(columns)
        const depots = await Depot.query()
          .eager('ownerships')
          .select(columns)
        const initiatives = await Initiative.query()
          .eager('ownerships')
          .select(columns)

        return featureCollection(
          filterOwnedEntries(
            farms.concat(depots).concat(initiatives),
            params.user.id
          )
        )
      }

      const farms = await Farm.query().select(columns)
      const depots = await Depot.query().select(columns)
      const initiatives = await Initiative.query().select(columns)
      return featureCollection(farms.concat(depots).concat(initiatives))
    }
  }

  app.use('/entries', service)
  app.service('entries').hooks({
    before: {
      find: [
        iff(
          ctx => ctx.params.headers.authorization,
          authentication.hooks.authenticate('jwt')
        )
      ]
    }
  })
}
