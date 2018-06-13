import { transaction } from 'objection'
import { FarmsDepots, FarmsProducts } from '../../app/models/farms'
import { InitiativesGoals } from '../../app/models/initiatives'
import Goals from '../../app/models/goals'
import Products from '../../app/models/products'

export const connectFarms = async ctx => {
  if (ctx.data.places) {
    await transaction(FarmsDepots.knex(), async trx => {
      await FarmsDepots.query(trx)
        .delete()
        .where('depot_id', ctx.result.id)

      const depotId = Number(ctx.result.id)
      await FarmsDepots.query(trx).insert(
        ctx.data.places.map(p => ({
          farm_id: p.id,
          depot_id: depotId
        }))
      )
    })
  }
}

export const connectProducts = async ctx => {
  if (ctx.data.products) {
    await transaction(FarmsProducts.knex(), async trx => {
      await FarmsProducts.query(trx)
        .delete()
        .where('farm_id', ctx.result.id)

      const productIds = await Products.query(trx).whereIn(
        'name',
        ctx.data.products
      )

      const farmId = Number(ctx.result.id)
      await FarmsProducts.query(trx).insert(
        productIds.map(p => ({
          farm_id: farmId,
          product_id: Number(p.id)
        }))
      )
    })
  }
}

export const connectGoals = async ctx => {
  if (ctx.data.goal_keys) {
    await transaction(InitiativesGoals.knex(), async trx => {
      await InitiativesGoals.query(trx)
        .delete()
        .where('initiative_id', ctx.result.id)

      const goalIds = await Goals.query(trx).whereIn('name', ctx.data.goal_keys)

      const initiativeId = Number(ctx.result.id)
      await FarmsProducts.query(trx).insert(
        goalIds.map(p => ({
          initiative_id: initiativeId,
          goal_id: Number(p.id)
        }))
      )
    })
  }
}
