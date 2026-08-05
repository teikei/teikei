import BaseModel from '../../models/base'

export default (app) => {
  const service = {
    find: async (params) => {
      const adminOrigins = params.user.adminOrigins
      const bounces = await BaseModel.knex().raw(
        `
      SELECT id, email, name, bounce_type, bounce_name from users
      where (bounce_type is not null
      or bounce_name is not null)
      and origin in (${['?', ...adminOrigins].map((_) => '?').join(',')})
      order by id
      `,
        ['dummy', ...params.user.adminOrigins]
      )
      return bounces.rows.map((b) => ({
        id: b.id,
        name: b.name,
        email: b.email,
        bounceType: b.bounce_type,
        bounceName: b.bounce_name
      }))
    }
  }

  app.use('/admin/bounces', service)
}
