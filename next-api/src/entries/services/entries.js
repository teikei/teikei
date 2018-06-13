import authentication from '@feathersjs/authentication/lib/index'
import { iff } from 'feathers-hooks-common'
import _ from 'lodash'

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
      const { eager, filter, userId } =
        params.query.filter === 'mine'
          ? {
              eager: 'ownerships',
              filter: filterOwnedEntries,
              userId: params.user && params.user.id
            }
          : { eager: '', filter: _.identity, userId: null }

      const farms = await Farm.query()
        .eager(eager)
        .select(columns)
      const depots = await Depot.query()
        .eager(eager)
        .select(columns)
      const initiatives = await Initiative.query()
        .eager(eager)
        .select(columns)
      return featureCollection(
        filter(farms.concat(depots).concat(initiatives), userId)
      )
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
