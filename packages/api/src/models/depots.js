import path from 'path'

import BaseModel from './base'
import { schemas } from './validation'

export default class Depot extends BaseModel {
  static tableName = 'depots'

  type() {
    return 'Depot'
  }

  link() {
    return `/depots/${this.id}`
  }

  static joiSchema = schemas.depot

  static relationMappings = {
    ownerships: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: path.resolve(__dirname, 'users'),
      join: {
        from: 'depots.id',
        through: {
          from: 'depots_users.depot_id',
          to: 'depots_users.user_id'
        },
        to: 'users.id'
      }
    },
    farms: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: path.resolve(__dirname, 'farms'),
      join: {
        from: 'depots.id',
        through: {
          from: 'farms_depots.depot_id',
          to: 'farms_depots.farm_id'
        },
        to: 'farms.id'
      }
    }
  }
}

export class DepotAdmin extends Depot {
  static joiSchema = schemas.depotAdmin

  static get modifiers() {
    return {
      hasOrigin: function (builder, origins) {
        builder.whereExists(function () {
          this.select('*')
            .from('depots_origins')
            .whereRaw('depots_origins.depot_id = depots.id')
            .whereIn('depots_origins.origin', origins)
        })
      }
    }
  }
}
