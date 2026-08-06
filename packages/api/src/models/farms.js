import Badge from './badges.js'
import BaseModel from './base.js'
import Depot from './depots.js'
import Product from './products.js'
import User from './users.js'
import { schemas } from './validation/index.js'

export default class Farm extends BaseModel {
  static tableName = 'farms'

  type() {
    return 'Farm'
  }

  link() {
    return `/farms/${this.id}`
  }

  static joiSchema = schemas.farm

  static get relationMappings() {
    return {
      ownerships: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: User,
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
        modelClass: Depot,
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
        modelClass: Product,
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
        modelClass: Badge,
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
}

export class FarmAdmin extends Farm {
  static joiSchema = schemas.farmAdmin

  static get modifiers() {
    return {
      hasBadge: function (builder, badgeId, origins) {
        builder
          .whereExists(function () {
            this.select('*')
              .from('farms_origins')
              .whereRaw('farms_origins.farm_id = farms.id')
              .whereIn('farms_origins.origin', origins)
          })
          .whereExists(function () {
            this.select('*')
              .from('farms_badges')
              .whereRaw('farms_badges.farm_id = farms.id')
              .whereRaw('farms_badges.badge_id = ?', [badgeId])
          })
      },
      notHasBadge: function (builder, badgeId, origins) {
        builder
          .whereExists(function () {
            this.select('*')
              .from('farms_origins')
              .whereRaw('farms_origins.farm_id = farms.id')
              .whereIn('farms_origins.origin', origins)
          })
          .whereNotExists(function () {
            this.select('*')
              .from('farms_badges')
              .whereRaw('farms_badges.farm_id = farms.id')
              .whereRaw('farms_badges.badge_id = ?', [badgeId])
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
