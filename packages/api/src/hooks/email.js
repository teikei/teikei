import { BadRequest } from '@feathersjs/errors'
import { disallow, iff } from 'feathers-hooks-common'
import _ from 'lodash'
import { logger } from '../logger.js'
import { createOriginsRepository } from '../repositories/origins.ts'
import { createUsersRepository } from '../repositories/users.ts'
import { parseGeoJSON } from './geoJson.js'
import { USER_SECRET_FIELDS } from './user.js'

export const disallowIfCampaignsDisabled = (app) =>
  iff(app.get('features').emailCampaigns !== 'true', disallow('external'))

export const permalink = ({ origin, baseurl }, { properties: { type, id } }) =>
  `${origin}${baseurl}/${type.toLowerCase()}s/${id}`

const getOriginConfiguration = async (app, origin) => {
  const origins = createOriginsRepository(app.get('kysely'))
  return (await origins.findByOrigin(origin)) ?? origins.findByOrigin('default')
}

export const sendConfirmationEmail = (ctx) => {
  // clone for email background job
  // (as ctx.result will be modified in following hooks)
  const user = Object.assign({}, ctx.result)

  ctx.app
    .service('emails')
    .create({
      template: 'confirmation_instructions',
      message: {
        to: user.email
      },
      locals: {
        locale: user.locale,
        user
      }
    })
    .catch((err) =>
      logger.warn(
        `failed to send confirmation email to user ${user.id} (${user.email}): ${err?.message}`,
        err
      )
    )

  // return early, emails will be sent asynchronously
  return ctx
}

export const sendNewEntryNotification = async (ctx) => {
  const { app } = ctx

  const admins = await createUsersRepository(
    app.get('kysely')
  ).findAdminsToNotify(ctx.params.user.origin)

  admins.forEach((admin) => {
    app
      .service('emails')
      .create({
        template: 'admin_notification',
        message: {
          to: admin.email
        },
        locals: {
          locale: admin.locale,
          user: _.omit(ctx.params.user, USER_SECRET_FIELDS),
          entry: ctx.result,
          permalink: permalink(ctx.params.user, parseGeoJSON(ctx.result))
        }
      })
      .catch((err) =>
        logger.warn(
          `failed to send admin notification email to user ${admin.id} (${admin.email}): ${err?.message}`,
          err
        )
      )
  })

  // return early, emails will be sent asynchronously
  return ctx
}

export const setEmailTemplateOriginLocals = async (ctx) => {
  if (ctx.params.render) {
    const originConfiguration = await getOriginConfiguration(ctx.app, 'default')
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
    ctx.app,
    ctx.data.locals.user.origin
  )
  ctx.data.locals = {
    ...ctx.data.locals,
    ...originConfiguration
  }
  return ctx
}
