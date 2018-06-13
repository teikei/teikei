/* eslint-disable no-undef,class-methods-use-this */
import { BaseModel, EntryBaseModel } from './base'

export default class Depot extends EntryBaseModel {
  static tableName = 'next_depots'

  type() {
    return 'Depot'
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
        from: 'next_depots.id',
        through: {
          from: 'next_depots_users.depot_id',
          to: 'next_depots_users.user_id'
        },
        to: 'users.id'
      }
    },
    places: {
      relation: EntryBaseModel.ManyToManyRelation,
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

export class DepotsUsers extends BaseModel {
  static tableName = 'next_depots_users'

  static jsonSchema = {
    type: 'object',
    properties: {
      farm_id: {
        type: 'integer'
      },
      user_id: {
        type: 'integer'
      }
    }
  }

  static relationMappings = {
    depot: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: `${__dirname}/depots`,
      join: {
        from: 'next_depots_users.depot_id',
        to: 'next_depots.id'
      }
    },
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: `${__dirname}/users`,
      join: {
        from: 'next_depots_users.user_id',
        to: 'users.id'
      }
    }
  }
}
