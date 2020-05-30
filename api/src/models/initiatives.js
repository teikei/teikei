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
      modelClass: `${__dirname}/users`,
      join: {
        from: 'initiatives.id',
        through: {
          from: 'initiatives_users.initiative_id',
          to: 'initiatives_users.user_id',
        },
        to: 'users.id',
      },
    },
    goals: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: `${__dirname}/goals`,
      join: {
        from: 'initiatives.id',
        through: {
          from: 'initiatives_goals.initiative_id',
          to: 'initiatives_goals.goal_id',
        },
        to: 'goals.id',
      },
    },
  }
}

export class InitiativeAdmin extends Initiative {
  static joiSchema = schemas.initiativeAdmin
}
