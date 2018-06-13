import authentication from '@feathersjs/authentication/lib/index'
import { iff } from 'feathers-hooks-common'

import Depot from '../../app/models/depots'
import Farm from '../../app/models/farms'
import Initiative from '../../app/models/initiatives'
import { featureCollection } from '../../app/util/jsonUtils'

const columns = ['id', 'name', 'city', 'latitude', 'longitude']

const filterOwnedEntries = (entries, userId) =>
  entries.filter(e => e.ownerships.some(o => o.id === userId)).map(o => {
    delete o.ownerships
    return o
  })

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

      if (params.query.filter === 'mine' && params.user) {
      }

      const farms = await Farm.query()
        .eager()
        .select(columns)
      const depots = await Depot.query().select(columns)
      const initiatives = await Initiative.query().select(columns)
      console.log('farms', farms)
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
