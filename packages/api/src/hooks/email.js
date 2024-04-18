import Role from '../models/roles'
import { parseGeoJSON } from './geoJson'
import { disallow, iff } from 'feathers-hooks-common'

export const disallowIfCampaignsDisabled = (app) =>
  iff(app.get('features').emailCampaigns !== 'true', disallow('external'))

export const permalink = ({ origin, baseurl }, { properties: { type, id } }) =>
  `${origin}${baseurl}/${type.toLowerCase()}s/${id}`

export const sendConfirmationEmail = (ctx) => {
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

export const sendNewEntryNotification = async (ctx) => {
  const { app } = ctx

  const adminRole = await Role.query()
    .withGraphFetched('users')
    .where({ name: 'admin' })
  const admins = adminRole[0].users

  admins.forEach((admin) => {
    if (admin.adminEmailNotifications) {
      app.service('emails').create({
        template: 'admin_notification',
        message: {
          to: admin.email
        },
        locals: {
          // locale: 'en'
          user: ctx.params.user,
          entry: ctx.result,
          permalink: permalink(
            ctx.params.user,
            parseGeoJSON(ctx.result.toJSON())
          )
        }
      })
    }
  })

  // return early, emails will be sent asynchronously
  return ctx
}
