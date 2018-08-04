/* eslint-disable no-undef,class-methods-use-this */
// import schema from '@teikei/schemas'
import { BaseModel, EntryBaseModel } from '../base'

export default class Initiative extends BaseModel {
  static tableName = 'initiatives'

  type() {
    return 'Initiative'
  }

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

export class InitiativesGoals extends BaseModel {
  static tableName = 'initiatives_goals'

  static jsonSchema = {
    type: 'object',
    properties: {
      farm_id: {
        type: 'integer'
      },
      product_id: {
        type: 'integer'
      }
    }
  }

  static relationMappings = {
    initiative: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: `${__dirname}/initiatives`,
      join: {
        from: 'initiatives_goals.initiative_id',
        to: 'initiatives.id'
      }
    },
    goal: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: `${__dirname}/goals`,
      join: {
        from: 'initiatives_goals.goal_id',
        to: 'goals.id'
      }
    }
  }
}

export class InitiativesUsers extends BaseModel {
  static tableName = 'initiatives_users'

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
    initiative: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: `${__dirname}/initiatives`,
      join: {
        from: 'initiatives_users.initiative_id',
        to: 'initiatives.id'
      }
    },
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: `${__dirname}/users`,
      join: {
        from: 'initiatives_users.user_id',
        to: 'users.id'
      }
    }
  }
}
