import path from 'path'

import { schemas } from './validation'
import BaseModel from './base'

export default class Initiative extends BaseModel {
  static tableName = 'initiatives'

  // eslint-disable-next-line class-methods-use-this
  type() {
    return 'Initiative'
  }

  link() {
    return `/initiatives/${this.id}`
  }

  static joiSchema = schemas.initiative

  static relationMappings = {
    ownerships: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: path.resolve(__dirname, 'users'),
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
      relation: BaseModel.ManyToManyRelation,
      modelClass: path.resolve(__dirname, 'goals'),
      join: {
        from: 'initiatives.id',
        through: {
          from: 'initiatives_goals.initiative_id',
          to: 'initiatives_goals.goal_id'
        },
        to: 'goals.id'
      }
    },
    badges: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: path.resolve(__dirname, 'badges'),
      join: {
        from: 'initiatives.id',
        through: {
          from: 'initiatives_badges.initiative_id',
          to: 'initiatives_badges.badge_id'
        },
        to: 'badges.id'
      }
    }
  }
}

export class InitiativeAdmin extends Initiative {
  static joiSchema = schemas.initiativeAdmin

  static get modifiers() {
    return {
      hasOrigin: function (builder, origins) {
        builder.whereExists(function () {
          this.select('*')
            .from('initiatives_origins')
            .whereRaw('initiatives_origins.initiative_id = initiatives.id')
            .whereIn('initiatives_origins.origin', origins)
        })
      }
    }
  }
}
