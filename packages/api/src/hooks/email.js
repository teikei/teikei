import { BadRequest } from '@feathersjs/errors'
import { disallow, iff } from 'feathers-hooks-common'
import Origin from '../models/origins'
import Role from '../models/roles'
import { parseGeoJSON } from './geoJson'

export const disallowIfCampaignsDisabled = (app) =>
  iff(app.get('features').emailCampaigns !== 'true', disallow('external'))

export const permalink = ({ origin, baseurl }, { properties: { type, id } }) =>
  `${origin}${baseurl}/${type.toLowerCase()}s/${id}`

const getOriginConfiguration = async (origin) => {
  const originConfiguration = await Origin.query().findOne({
    origin
  })
  if (!originConfiguration) {
    return Origin.query().findOne({
      origin: 'default'
    })
  }
  return originConfiguration
}

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
    .withGraphFetched('users.[adminOrigins]')
    .where({ name: 'admin' })
  const admins = adminRole[0].users

  admins.forEach((admin) => {
    if (
      admin.adminEmailNotifications &&
      admin.adminOrigins.includes(ctx.params.user.origin)
    ) {
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

export const setEmailTemplateOriginLocals = async (ctx) => {
  if (ctx.params.render) {
    const originConfiguration = await getOriginConfiguration('default')
    // render template with default origin
    ctx.data.locals = {
      ...ctx.data.locals,
      ...originConfiguration
    }
    return ctx
  }
  if (!ctx.data.locals.user) {
    throw new BadRequest(
      'Cannot send email without user data, add user to locals.user'
    )
  }
  const originConfiguration = await getOriginConfiguration(
    ctx.data.locals.user.origin
  )
  ctx.data.locals = {
    ...ctx.data.locals,
    ...originConfiguration
  }
  return ctx
}
