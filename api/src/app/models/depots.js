import schema from '@teikei/schemas'

import { BaseModel, EntryBaseModel } from './base'

export default class Depot extends EntryBaseModel {
  static tableName = 'depots'

  // eslint-disable-next-line class-methods-use-this
  type() {
    return 'Depot'
  }

  static jsonSchema = schema.depot

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
