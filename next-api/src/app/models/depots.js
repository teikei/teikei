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
    }
    // farms: {
    //   relation: Model.ManyToManyRelation,
    //   modelClass: `${__dirname}/places`,
    //   join: {
    //     from: 'places.id',
    //     through: {
    //       from: 'place_connections.place_a_id',
    //       to: 'place_connections.place_b_id'
    //     },
    //     to: 'places.id'
    //   }
    // },
    // depots: {
    //   relation: Model.ManyToManyRelation,
    //   modelClass: `${__dirname}/places`,
    //   join: {
    //     from: 'places.id',
    //     through: {
    //       from: 'place_connections.place_b_id',
    //       to: 'place_connections.place_a_id'
    //     },
    //     to: 'places.id'
    //   }
    // }
  }
}
