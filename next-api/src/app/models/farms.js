/* eslint-disable no-undef,class-methods-use-this */
import { EntryBaseModel } from './base'

export default class Farm extends EntryBaseModel {
  static tableName = 'next_farms'

  type() {
    return 'Farm'
  }

  static jsonSchema = {
    type: 'object',
    properties: {
      id: {
        type: 'integer'
      },
      name: {
        type: 'string',
        maxLength: 100
      },
      city: {
        type: 'string',
        maxLength: 100
      },
      address: {
        type: 'string',
        maxLength: 100
      },
      latitude: {
        type: 'number'
      },
      longitude: {
        type: 'number'
      },
      url: {
        type: 'string',
        format: 'uri'
      },
      created_at: {
        type: 'date-time'
      },
      updated_at: {
        type: 'date-time'
      }
    }
  }

  static relationMappings = {
    ownerships: {
      relation: EntryBaseModel.ManyToManyRelation,
      modelClass: `${__dirname}/users`,
      join: {
        from: 'next_farms.id',
        through: {
          from: 'next_farms_users.farm_id',
          to: 'next_farms_users.user_id'
        },
        to: 'users.id'
      }
    },
    places: {
      relation: EntryBaseModel.ManyToManyRelation,
      modelClass: `${__dirname}/depots`,
      join: {
        from: 'next_farms.id',
        through: {
          from: 'next_farms_depots.farm_id',
          to: 'next_farms_depots.depot_id'
        },
        to: 'next_depots.id'
      }
    },
    products: {
      relation: EntryBaseModel.ManyToManyRelation,
      modelClass: `${__dirname}/products`,
      join: {
        from: 'next_farms.id',
        through: {
          from: 'next_farms_products.farm_id',
          to: 'next_farms_products.product_id'
        },
        to: 'next_products.id'
      }
    }
  }
}
