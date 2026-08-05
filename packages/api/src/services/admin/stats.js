import BaseModel from '../../models/base'

export default (app) => {
  const service = {
    find: async () => {
      const depotCount = await BaseModel.knex().raw(`
        SELECT count(*) from depots
      `)
      const farmCount = await BaseModel.knex().raw(`
        SELECT count(*) from farms
      `)
      const initiativeCount = await BaseModel.knex().raw(`
        SELECT count(*) from initiatives
      `)
      const userStats = await BaseModel.knex().raw(`
      SELECT state, count(*) from users group by state
      `)
      return [
        { id: 1, resource: 'farms', stats: farmCount.rows[0] },
        { id: 2, resource: 'depots', stats: depotCount.rows[0] },
        { id: 3, resource: 'initiatives', stats: initiativeCount.rows[0] },
        { id: 4, resource: 'users', stats: userStats.rows }
      ]
    }
  }

  app.use('/admin/stats', service)
}
