import BaseModel from "../models/base"

export default (app) => {
  const service = {
    create: async () =>
      BaseModel.knex().raw(
        "REFRESH MATERIALIZED VIEW CONCURRENTLY entries_search",
      ),
  }

  app.use("/searchindex", service)
}
