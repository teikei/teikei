import { transaction } from 'objection'

import Depot from '../models/depots'
import Farm from '../models/farms'
import Initiative from '../models/initiatives'
import Goals from '../models/goals'

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
      await model
        .query(ctx.result.id)
        .$relatedQuery('users', trx)
        .unrelate()
      await model
        .query(ctx.result.id)
        .$relatedQuery('users', trx)
        .relate(ctx.params.user.id)
    })
  }
}

export const withEager = $eager => ctx => {
  ctx.params.query = Object.assign({}, ctx.params.query, {
    $eager
  })
}
