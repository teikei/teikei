/* eslint-disable no-undef,class-methods-use-this */
import schema from '@teikei/schemas'

import { EntryBaseModel } from './base'
import { goalsToArray } from '../util/jsonUtils'

export default class Initiative extends EntryBaseModel {
  static tableName = 'initiatives'

  $formatJson(json) {
    return goalsToArray(super.$formatJson(json))
  }

  type() {
    return 'Initiative'
  }

  static jsonSchema = schema.initiative

  static relationMappings = {
    ownerships: {
      relation: EntryBaseModel.ManyToManyRelation,
      modelClass: `${__dirname}/users`,
      join: {
        from: 'initiatives.id',
        through: {
          from: 'initiatives_users.initiative_id',
          to: 'initiatives_users.user_id'
        },
        to: 'users.id'
      }
    },
    goals: {
      relation: EntryBaseModel.ManyToManyRelation,
      modelClass: `${__dirname}/goals`,
      join: {
        from: 'initiatives.id',
        through: {
          from: 'initiatives_goals.initiative_id',
          to: 'initiatives_goals.goal_id'
        },
        to: 'goals.id'
      }
    }
  }
}
