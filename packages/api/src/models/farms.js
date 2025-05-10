import path from 'path'
import BaseModel from './base'
import { schemas } from './validation'

export default class Farm extends BaseModel {
  static tableName = 'farms'

  type() {
    return 'Farm'
  }

  link() {
    return `/farms/${this.id}`
  }

  static joiSchema = schemas.farm

  static relationMappings = {
    ownerships: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: path.resolve(__dirname, 'users'),
      join: {
        from: 'farms.id',
        through: {
          from: 'farms_users.farm_id',
          to: 'farms_users.user_id'
        },
        to: 'users.id'
      }
    },
    depots: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: path.resolve(__dirname, 'depots'),
      join: {
        from: 'farms.id',
        through: {
          from: 'farms_depots.farm_id',
          to: 'farms_depots.depot_id'
        },
        to: 'depots.id'
      }
    },
    products: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: path.resolve(__dirname, 'products'),
      join: {
        from: 'farms.id',
        through: {
          from: 'farms_products.farm_id',
          to: 'farms_products.product_id'
        },
        to: 'products.id'
      }
    },
    badges: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: path.resolve(__dirname, 'badges'),
      join: {
        from: 'farms.id',
        through: {
          from: 'farms_badges.farm_id',
          to: 'farms_badges.badge_id'
        },
        to: 'badges.id'
      }
    }
  }
}

export class FarmAdmin extends Farm {
  static joiSchema = schemas.farmAdmin

  static get modifiers() {
    return {
      hasBadge: function (builder, badgeId, origins, origins) {
        builder.whereExists(function () {
          this.select('*')
            .from('farms_badges')
            .join(
              'farms_origins',
              'farms_badges.farm_id',
              'farms_origins.farm_id'
            )
            .whereRaw('farms_badges.farm_id = farms.id')
            .whereRaw(`farms_badges.badge_id = ${badgeId}`)
        })
      },
      notHasBadge: function (builder, badgeId, origins) {
        builder.whereNotExists(function () {
          this.select('*')
            .from('farms_badges')
            .join(
              'farms_origins',
              'farms_badges.farm_id',
              'farms_origins.farm_id'
            )
            .whereRaw('farms_badges.farm_id = farms.id')
            .whereRaw(`farms_badges.badge_id = ${badgeId}`)
        })
      },
      hasOrigin: function (builder, origins) {
        builder.whereExists(function () {
          this.select('*')
            .from('farms_origins')
            .whereRaw('farms_origins.farm_id = farms.id')
            .whereIn('farms_origins.origin', origins)
        })
      }
    }
  }
}
