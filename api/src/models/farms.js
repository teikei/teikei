import { schemas } from './validation'
import BaseModel from './base'

export default class Farm extends BaseModel {
  static tableName = 'farms'

  // eslint-disable-next-line class-methods-use-this
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
    depots: {
      relation: BaseModel.ManyToManyRelation,
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
      relation: BaseModel.ManyToManyRelation,
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

export class FarmAdmin extends Farm {
  static joiSchema = schemas.farmAdmin
}
