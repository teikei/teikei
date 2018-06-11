import { Model } from 'objection'

export default class Depot extends Model {
  static tableName = 'next_depots'

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
      relation: Model.ManyToManyRelation,
      modelClass: `${__dirname}/users`,
      join: {
        from: 'next_depots.id',
        through: {
          from: 'next_depots_users.depot_id',
          to: 'next_depots_users.user_id'
        },
        to: 'users.id'
      }
    },
    places: {
      relation: Model.ManyToManyRelation,
      modelClass: `${__dirname}/farms`,
      join: {
        from: 'next_depots.id',
        through: {
          from: 'next_farms_depots.depot_id',
          to: 'next_farms_depots.farm_id'
        },
        to: 'next_farms.id'
      }
    }
  }
}
