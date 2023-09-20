import BaseModel from '../../models/base'

export default (app) => {
  const service = {
    find: async () => {
      const entryStats = await BaseModel.knex().raw(`
      SELECT count(*) from farms
      UNION
      SELECT count(*) from depots
      UNION
      SELECT count(*) from initiatives
      `)
      const userStats = await BaseModel.knex().raw(`
      SELECT state, count(*) from users group by state
      `)
      return [
        { id: 1, resource: 'farms', stats: entryStats.rows[0] },
        { id: 2, resource: 'depots', stats: entryStats.rows[1] },
        { id: 3, resource: 'initiatives', stats: entryStats.rows[2] },
        { id: 4, resource: 'users', stats: userStats.rows },
      ]
    },
  }

  app.use('/admin/stats', service)

  app
    .service('/admin/stats')
    .hooks({
      before: {
        all: [],
        find: [],
      },
      after: {
        all: [],
        find: [],
      },
      error: {
        all: [],
        find: [],
      },
    })
    .hooks({
      after: {
        all: [],
      },
    })
}
