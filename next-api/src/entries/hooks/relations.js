import { transaction } from 'objection'
import { DepotsUsers } from '../../app/models/depots'
import { FarmsDepots, FarmsProducts, FarmsUsers } from '../../app/models/farms'
import {
  InitiativesGoals,
  InitiativesUsers
} from '../../app/models/initiatives'
import Goals from '../../app/models/goals'
import Products from '../../app/models/products'

export const connectFarms = async ctx => {
  if (ctx.data.places) {
    await transaction(FarmsDepots.knex(), async trx => {
      await FarmsDepots.query(trx)
        .delete()
        .where('depot_id', ctx.result.id)

      const depotId = parseInt(ctx.result.id, 10)
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

      const farmId = parseInt(ctx.result.id, 10)
      await FarmsProducts.query(trx).insert(
        productIds.map(p => ({
          farm_id: farmId,
          product_id: parseInt(p.id, 10)
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

      const initiativeId = parseInt(ctx.result.id, 10)
      await FarmsProducts.query(trx).insert(
        goalIds.map(p => ({
          initiative_id: initiativeId,
          goal_id: parseInt(p.id, 10)
        }))
      )
    })
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
    console.log('ctx.params.user.id', ctx.params.user.id)
    console.log('ctx.result.id', ctx.result.id)
    console.log('model', model)
    console.log('column', column)

    await model.query().insert({
      user_id: parseInt(ctx.params.user.id, 10),
      [column]: ctx.result.id
    })
  }
}
