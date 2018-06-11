/* eslint-disable no-undef,class-methods-use-this */
import { EntryBaseModel } from './base'

export default class Initiative extends EntryBaseModel {
  static tableName = 'next_initiatives'

  type() {
    return 'Initiative'
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
        from: 'next_initiatives.id',
        through: {
          from: 'next_initiatives_users.initiative_id',
          to: 'next_initiatives_users.user_id'
        },
        to: 'users.id'
      }
    }
  }
}
