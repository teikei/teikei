import { transaction } from 'objection'
import { iff } from 'feathers-hooks-common'

import Depot from '../models/depots'
import Farm from '../models/farms'
import Initiative from '../models/initiatives'
import Goals from '../models/goals'

const qualify = (model, attribute) =>
  model ? `${model}.${attribute}` : attribute

export const entryColumns = model => [
  qualify(model, 'id'),
  'name',
  'city',
  'latitude',
  'longitude'
]

export const selectEntryColumns = ctx => {
  ctx.params.query.$select = entryColumns()
}

export const relate = (model, relation) => async ctx => {
  try {
    if (ctx.data[relation]) {
      await transaction(model.knex(), async trx => {
        const modelInstance = await model
          .query(trx)
          .findById(ctx.result.id || ctx.data.id)
        await modelInstance.$relatedQuery(relation, trx).unrelate()
        await modelInstance
          .$relatedQuery(relation, trx)
          .relate(ctx.data[relation])
      })
      ctx.result[relation] = ctx.data[relation]
    }
  } catch (e) {
    ctx.app.error(e)
  }
}

export const connectGoals = async ctx => {
  ctx.data.goals = await Goals.query().whereIn('name', ctx.data.goals)
  return relate(Initiative, 'goals')(ctx)
}

const modelForType = {
  Depot,
  Farm,
  Initiative
}

export const relateOwner = async ctx => {
  if (ctx.params.user) {
    const model = modelForType[ctx.result.type()]
    await transaction(model.knex(), async trx => {
      const modelInstance = await model.query(trx).findById(ctx.result.id)
      modelInstance.$relatedQuery('ownerships', trx).unrelate()
      await modelInstance
        .$relatedQuery('ownerships', trx)
        .relate(ctx.params.user.id)
    })
  }
}

export const withEager = eager =>
  iff(ctx =>!ctx.params.query.$eager , ctx => {
    ctx.params.query.$eager = eager
  })

export const filterOwnedEntries = ctx => {
  ctx.result = ctx.params.user
    ? ctx.result
        .filter(e => e.ownerships.some(o => o.id === ctx.params.user.id))
        .map(o => {
          // eslint-disable-next-line no-param-reassign
          delete o.ownerships
          return o
        })
    : []
}
