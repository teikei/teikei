import { entryColumns } from '../../hooks/relations.js'
import User from '../../models/users.js'

export default (app) => {
  const service = {
    find: async (params) => {
      const farms = await User.relatedQuery('farms')
        .for(params.query.userId)
        .select(entryColumns('farms'))
      const depots = await User.relatedQuery('depots')
        .for(params.query.userId)
        .select(entryColumns('depots'))
      const initiatives = await User.relatedQuery('initiatives')
        .for(params.query.userId)
        .select(entryColumns('initiatives'))
      return farms
        .concat(depots)
        .concat(initiatives)
        .map((e) => ({
          ...e,
          id: `${e.type()}_${e.id}`,
          type: e.type(),
          _id: e.id
        }))
    }
  }

  app.use('/admin/entries', service)
}
