import { BadRequest } from '@feathersjs/errors'
import { disallow, iff } from 'feathers-hooks-common'
import Role from '../models/roles'
import { getOriginConfiguration } from '../origins'
import { parseGeoJSON } from './geoJson'

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
      locale: user.locale,
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
          locale: admin.locale,
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

export const setEmailTemplateOriginLocals = (ctx) => {
  if (ctx.params.render) {
    // render template with default origin
    ctx.data.locals = {
      ...ctx.data.locals,
      ...getOriginConfiguration('https://www.ernte-teilen.org')
    }
    return ctx
  }
  if (!ctx.data.locals.user) {
    throw new BadRequest(
      'Cannot send email without user data, add user to locals.user'
    )
  }
  ctx.data.locals = {
    ...ctx.data.locals,
    origin: ctx.data.locals.user.origin,
    baseurl: ctx.data.locals.user.baseurl,
    ...getOriginConfiguration(ctx.data.locals.user.origin)
  }
  return ctx
}
