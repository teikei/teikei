import createService from "feathers-objection"
import { disallow } from "feathers-hooks-common"

import Goal from "../models/goals"
import filterAllowedFields from "../hooks/filterAllowedFields"

export default (app) => {
  const service = createService({
    model: Goal,
  })

  app.use("/goals", service)
  app.service("goals").hooks({
    before: {
      create: [disallow("external")],
      update: [disallow()],
      patch: [disallow("external")],
      remove: [disallow("external")],
    },
    after: {
      find: [filterAllowedFields],
      get: [filterAllowedFields],
      create: [filterAllowedFields],
      patch: [filterAllowedFields],
      remove: [filterAllowedFields],
    },
  })
}
