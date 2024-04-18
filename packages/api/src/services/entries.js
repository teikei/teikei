import { iff } from "feathers-hooks-common"
import _ from "lodash"

import Depot from "../models/depots"
import Farm from "../models/farms"
import Initiative from "../models/initiatives"
import toGeoJSON from "../hooks/geoJson"
import { entryColumns, filterOwnedEntries, withEager } from "../hooks/relations"
import filterAllowedFields from "../hooks/filterAllowedFields"

export default (app) => {
  const service = {
    find: async (params) => {
      const farms = await Farm.query()
        .where({ active: true })
        .withGraphFetched(params.query.$eager || "products")
        .modifyGraph("products", (b) =>
          b.select(["products.id", "category", "name"]),
        )
        .select(entryColumns())
      const depots = await Depot.query()
        .where({ active: true })
        .withGraphFetched(params.query.$eager)
        .select(entryColumns())
      const initiatives = await Initiative.query()
        .where({ active: true })
        .withGraphFetched(params.query.$eager || "goals")
        .select(entryColumns())
      return farms.concat(depots).concat(initiatives)
    },
  }

  app.use("/entries", service)

  app.service("entries").hooks({
    before: {
      find: [
        iff((ctx) => _.has(ctx.params.query, "mine"), withEager("ownerships")),
      ],
    },
    after: {
      find: [
        iff((ctx) => _.has(ctx.params.query, "mine"), filterOwnedEntries),
        filterAllowedFields,
        toGeoJSON(),
      ],
    },
  })
}
