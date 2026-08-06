import { iff } from 'feathers-hooks-common'
import _ from 'lodash'
import filterAllowedFields from '../hooks/filterAllowedFields.js'
import toGeoJSON from '../hooks/geoJson.js'
import {
  entryColumns,
  filterOwnedEntries,
  publicEntryColumns
} from '../hooks/relations.js'
import Depot from '../models/depots.js'
import Farm from '../models/farms.js'
import Initiative from '../models/initiatives.js'

export default (app) => {
  const service = {
    find: async (params) => {
      // The client-supplied $eager is intentionally NOT used: passing it into
      // withGraphFetched let anonymous callers traverse into the `ownerships`
      // (users) relation and read password hashes / reset tokens, and exposed
      // private address fields. Eager loading is fixed server-side instead.
      //
      // `mine` returns the authenticated user's own entries (see
      // filterOwnedEntries, which strips `ownerships` before responding). Only
      // that path may load ownerships and the owner-only address columns.
      const includeOwnerships = _.has(params.query, 'mine') && !!params.user
      const columns = includeOwnerships ? entryColumns() : publicEntryColumns()

      const withOwnerships = (query) =>
        includeOwnerships
          ? query
              .withGraphFetched('ownerships')
              .modifyGraph('ownerships', (b) => b.select('users.id'))
          : query

      const farms = await withOwnerships(
        Farm.query()
          .where({ active: true })
          .withGraphFetched('products')
          .modifyGraph('products', (b) =>
            b.select(['products.id', 'category', 'name'])
          )
      ).select(columns)
      const depots = await withOwnerships(
        Depot.query().where({ active: true })
      ).select(columns)
      const initiatives = await withOwnerships(
        Initiative.query().where({ active: true }).withGraphFetched('goals')
      ).select(columns)
      return farms.concat(depots).concat(initiatives)
    }
  }

  app.use('/entries', service)

  app.service('entries').hooks({
    after: {
      find: [
        iff((ctx) => _.has(ctx.params.query, 'mine'), filterOwnedEntries),
        filterAllowedFields,
        toGeoJSON()
      ]
    }
  })
}
