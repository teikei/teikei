import Role from '../models/roles'

export const permalink = ({ origin, baseurl }, { type, id }) =>
  `${origin}${baseurl}/${type().toLowerCase()}s/${id}`

export const sendConfirmationEmail = ctx => {
  // clone for email background job
  // (as ctx.result will be modified in following hooks)
  const user = Object.assign({}, ctx.result)

  ctx.app.service('emails').create({
    template: 'confirmation_instructions',
    message: {
      to: user.email
    },
    locals: {
      // locale: 'en'
      user
    }
  })

  // return early, emails will be sent asynchronously
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

  // return early, emails will be sent asynchronously
  return ctx
}
