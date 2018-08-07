import { transaction } from 'objection'
import { DepotsUsers } from '../app/models/depots'
import { FarmsDepots, FarmsProducts, FarmsUsers } from '../app/models/farms'
import { InitiativesGoals, InitiativesUsers } from '../app/models/initiatives'
import Goals from '../app/models/goals'
import Products from '../app/models/products'

export const connectFarms = async ctx => {
  if (ctx.data.places) {
    await transaction(FarmsDepots.knex(), async trx => {
      await FarmsDepots.query(trx)
        .delete()
        .where('depot_id', ctx.result.id)

      const depotId = parseInt(ctx.result.id, 10)
      await FarmsDepots.query(trx).insert(
        ctx.data.places.map(p => ({
          farm_id: parseInt(p, 10),
          depot_id: depotId
        }))
      )
    })
  }
}

export const connectProductsById = async ctx => {
  if (ctx.data.products) {
    await transaction(FarmsProducts.knex(), async trx => {
      await FarmsProducts.query(trx)
        .delete()
        .where('farm_id', ctx.result.id)

      const farmId = parseInt(ctx.result.id, 10)
      await FarmsProducts.query(trx).insert(
        products.map(p => ({
          farm_id: farmId,
          product_id: parseInt(p.id, 10)
        }))
      )
    })
    ctx.result.products = ctx.data.products
  }
}

export const connectGoals = async ctx => {
  if (ctx.data.goals) {
    await transaction(InitiativesGoals.knex(), async trx => {
      await InitiativesGoals.query(trx)
        .delete()
        .where('initiative_id', ctx.result.id)

      const goalIds = await Goals.query(trx).whereIn('name', ctx.data.goals)

      const initiativeId = parseInt(ctx.result.id, 10)
      await InitiativesGoals.query(trx).insert(
        goalIds.map(g => ({
          initiative_id: initiativeId,
          goal_id: parseInt(g.id, 10)
        }))
      )
    })
    ctx.result.goals = ctx.data.goals
  }
}

export const connectGoalsById = async ctx => {
  if (ctx.data.goals) {
    await transaction(InitiativesGoals.knex(), async trx => {
      await InitiativesGoals.query(trx)
        .delete()
        .where('initiative_id', ctx.result.id)

      const initiativeId = ctx.result.id
      await InitiativesGoals.query(trx).insert(
        ctx.data.goals.map(goal_id => {
          return ({
            initiative_id: initiativeId,
            goal_id
          })
        })
      )
    })
    ctx.result.goals = ctx.data.goals
  }
}

const queryInfos = {
  Depot: { model: DepotsUsers, column: 'depot_id' },
  Farm: { model: FarmsUsers, column: 'farm_id' },
  Initiative: { model: InitiativesUsers, column: 'initiative_id' }
}

export const connectOwner = async ctx => {
  if (ctx.params.user) {
    const { model, column } = queryInfos[ctx.result.type()]

    await model.query().insert({
      user_id: parseInt(ctx.params.user.id, 10),
      [column]: parseInt(ctx.result.id, 10)
    })
  }
}

export const withEager = $eager => ctx => {
  ctx.params.query = Object.assign({}, ctx.params.query, {
    $eager
  })
}
