import { transaction } from 'objection'
import { Depot } from '../app/models/depots'
import { Farm } from '../app/models/farms'
import { Initiative } from '../app/models/initiatives'
import { FarmsDepots } from '../app/models/farms'
import Goals from '../app/models/goals'

export const relate = (model, relation) => async ctx => {
  if (ctx.data[relation]) {
    await transaction(model.knex(), async trx => {
      const modelInstance = await model.query(trx).findById(ctx.result.id)
      await modelInstance.$relatedQuery(relation, trx).unrelate()
      await modelInstance.$relatedQuery(relation, trx).relate(ctx.data[relation])
    })
    ctx.result[relation] = ctx.data[relation]
  }
}

export const connectGoals = async ctx => {
  ctx.data.goals = await Goals.query(trx).whereIn('name', ctx.data.goals)
  return relate(Initiative, 'goals')(ctx)
}

const modelForType = {
  Depot: Depot,
  Farm: Farm,
  Initiative: Initiative
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
