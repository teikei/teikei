import { iff } from 'feathers-hooks-common'
import { transaction } from 'objection'
import { logger } from '../logger.js'

const qualify = (model, attribute) =>
  model ? `${model}.${attribute}` : attribute

export const userColumns = () => [
  qualify('users', 'id'),
  'email',
  'name',
  'origin',
  'baseurl',
  'phone',
  'isVerified',
  'createdAt',
  'updatedAt',
  'lastLogin',
  'adminEmailNotifications',
  'resetAttempts',
  'state',
  'active'
]

export const selectUserColumns = (ctx) => {
  if (!ctx.params.query) {
    ctx.params.query = {}
  }
  if (!ctx.params.query.$select) {
    ctx.params.query.$select = userColumns()
  }
}

export const relate = (model, relation) => async (ctx) => {
  try {
    if (ctx.data[relation]) {
      await transaction(model.knex(), async (trx) => {
        const modelInstance = await model
          .query(trx)
          .findById(ctx.result.id || ctx.data.id)
        await model.query(trx).upsertGraph(
          {
            id: modelInstance.id,
            [relation]: ctx.data[relation].map((id) => ({ id }))
          },
          {
            relate: true,
            unrelate: true
          }
        )
        ctx.result[relation] = await modelInstance.$relatedQuery(relation, trx)
      })
    }
  } catch (e) {
    logger.error(e)
  }
}

export const withEager = (eager) =>
  iff(
    (ctx) => !ctx.params.query || !ctx.params.query.$eager,
    (ctx) => {
      ctx.params.query = ctx.params.query || {}
      ctx.params.query.$eager = eager
    }
  )
