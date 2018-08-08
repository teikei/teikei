/* eslint-disable no-undef,class-methods-use-this */
import schema from '@teikei/schemas'
import { EntryBaseModel } from './base'

export default class Farm extends EntryBaseModel {
  static tableName = 'farms'

  type() {
    return 'Farm'
  }

  static jsonSchema = schema.farm

  static relationMappings = {
    ownerships: {
      relation: EntryBaseModel.ManyToManyRelation,
      modelClass: `${__dirname}/users`,
      join: {
        from: 'farms.id',
        through: {
          from: 'farms_users.farm_id',
          to: 'farms_users.user_id'
        },
        to: 'users.id'
      }
    },
    places: {
      relation: EntryBaseModel.ManyToManyRelation,
      modelClass: `${__dirname}/depots`,
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
      relation: EntryBaseModel.ManyToManyRelation,
      modelClass: `${__dirname}/products`,
      join: {
        from: 'farms.id',
        through: {
          from: 'farms_products.farm_id',
          to: 'farms_products.product_id'
        },
        to: 'products.id'
      }
    }
  }
}
