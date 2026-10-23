import { BadRequest } from '@feathersjs/errors'
import type { Application, HookContext } from '@feathersjs/feathers'
import { disallow, iff } from 'feathers-hooks-common'
import type { Feature } from 'geojson'
import { logger } from '../logger.ts'
import { createOriginsRepository } from '../repositories/origins.ts'
import { createUsersRepository } from '../repositories/users.ts'
import { parseGeoJSON } from './geoJson.ts'
import { USER_SECRET_FIELDS } from './user.ts'

export const disallowIfCampaignsDisabled = (app: Application) =>
  iff(app.get('features').emailCampaigns !== 'true', disallow('external'))

export const permalink = (
  { origin, baseurl }: { origin: string; baseurl: string },
  { properties: { type, id } }: Feature<{ type: string; id: string }>
) => `${origin}${baseurl}/${type.toLowerCase()}s/${id}`

const getOriginConfiguration = async (app: Application, origin: string) => {
  const origins = createOriginsRepository(app.get('kysely'))
  return (await origins.findByOrigin(origin)) ?? origins.findByOrigin('default')
}

export const sendConfirmationEmail = (ctx: HookContext) => {
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

export const sendNewEntryNotification = async (ctx: HookContext) => {
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
          user: Object.fromEntries(
            Object.entries(ctx.params.user).filter(
              ([key]) => !USER_SECRET_FIELDS.includes(key)
            )
          ),
          entry: ctx.result,
          // A single entry parses to a Feature.
          permalink: permalink(
            ctx.params.user,
            parseGeoJSON(ctx.result) as Feature<{ type: string; id: string }>
          )
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

export const setEmailTemplateOriginLocals = async (ctx: HookContext) => {
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
