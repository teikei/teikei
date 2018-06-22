import { BaseModel, EntryBaseModel } from './base'
import schema from '../../../../schemas/entities/depot.json'

export default class Depot extends EntryBaseModel {
  static tableName = 'depots'

  // eslint-disable-next-line class-methods-use-this
  type() {
    return 'Depot'
  }

  static jsonSchema = schema

  static relationMappings = {
    ownerships: {
      relation: EntryBaseModel.ManyToManyRelation,
      modelClass: `${__dirname}/users`,
      join: {
        from: 'depots.id',
        through: {
          from: 'depots_users.depot_id',
          to: 'depots_users.user_id'
        },
        to: 'users.id'
      }
    },
    places: {
      relation: EntryBaseModel.ManyToManyRelation,
      modelClass: `${__dirname}/farms`,
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

export class DepotsUsers extends BaseModel {
  static tableName = 'depots_users'

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
        from: 'depots_users.depot_id',
        to: 'depots.id'
      }
    },
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: `${__dirname}/users`,
      join: {
        from: 'depots_users.user_id',
        to: 'users.id'
      }
    }
  }
}
