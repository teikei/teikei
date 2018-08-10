import Role from '../models/roles'

export const permalink = ({ origin, baseurl }, { type, id }) =>
  `${origin}${baseurl}/${type().toLowerCase()}s/${id}`

export const sendConfirmationEmail = ctx => {
  ctx.app.service('emails').create({
    template: 'confirmation_instructions',
    message: {
      to: ctx.result.email
    },
    locals: {
      // locale: 'en'
      user: ctx.result
    }
  })
  return ctx
}

export const sendNewEntryNotification = async ctx => {
  const { app } = ctx

  const adminRole = await Role.query()
    .eager('users')
    .where({ name: 'admin' })
  const admins = adminRole[0].users

  admins.forEach(admin => {
    app.service('emails').create({
      template: 'admin_notification',
      message: {
        to: admin.email
      },
      locals: {
        // locale: 'en'
        user: ctx.params.user,
        entry: ctx.result,
        permalink: permalink(ctx.params.user, ctx.result)
      }
    })
  })

  return ctx
}
