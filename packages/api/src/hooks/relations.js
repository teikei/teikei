import { transaction } from 'objection'
import { iff } from 'feathers-hooks-common'

import Depot from '../models/depots'
import Farm from '../models/farms'
import Initiative from '../models/initiatives'
import { logger } from '../logger'

const qualify = (model, attribute) =>
  model ? `${model}.${attribute}` : attribute

export const entryColumns = (model) => [
  qualify(model, 'id'),
  'name',
  'postalcode',
  'city',
  'state',
  'country',
  'latitude',
  'longitude',
]

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
  'active',
]

export const selectEntryColumns = (ctx) => {
  if (!ctx.params.query) {
    ctx.params.query = {}
  }
  if (!ctx.params.query.$select) {
    ctx.params.query.$select = entryColumns()
  }
}

export const selectUserColumns = (ctx) => {
  if (!ctx.params.query) {
    ctx.params.query = {}
  }
  if (!ctx.params.query.$select) {
    ctx.params.query.$select = userColumns()
  }
}

export const selectActiveEntries = (ctx) => {
  ctx.params.query.active = true
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
            [relation]: ctx.data[relation].map((id) => ({ id })),
          },
          {
            relate: true,
            unrelate: true,
          },
        )
        ctx.result[relation] = await modelInstance.$relatedQuery(relation, trx)
      })
    }
  } catch (e) {
    logger.error(e)
  }
}

const modelForType = {
  Depot,
  Farm,
  Initiative,
}

export const relateOwner = async (ctx) => {
  if (ctx.params.user) {
    const model = modelForType[ctx.result.type()]
    await transaction(model.knex(), async (trx) => {
      await model.query(trx).upsertGraph(
        {
          id: ctx.result.id,
          ownerships: [{ id: ctx.params.user.id }],
        },
        {
          relate: true,
          unrelate: true,
        },
      )
    })
  }
}

export const withEager = (eager) =>
  iff(
    (ctx) => !ctx.params.query || !ctx.params.query.$eager,
    (ctx) => {
      ctx.params.query = ctx.params.query || {}
      ctx.params.query.$eager = eager
    },
  )

export const filterOwnedEntries = (ctx) => {
  ctx.result = ctx.params.user
    ? ctx.result
        .filter((e) => e.ownerships.some((o) => o.id === ctx.params.user.id))
        .filter((e) => {
          return (
            !ctx.params.query ||
            !(ctx.params.query.id && ctx.params.query.type) ||
            (e.id === ctx.params.query.id &&
              e.type().toLowerCase() === ctx.params.query.type)
          )
        })
        .map((o) => {
          // eslint-disable-next-line no-param-reassign
          delete o.ownerships
          return o
        })
    : []
}
