import path from 'path'
import BaseModel from './base'
import { schemas } from './validation'

export default class User extends BaseModel {
  static tableName = 'users'

  // eslint-disable-next-line class-methods-use-this
  type() {
    return 'User'
  }

  link() {
    return `/users/${this.id}`
  }

  static joiSchema = schemas.user

  static relationMappings = {
    roles: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: path.resolve(__dirname, 'roles'),
      join: {
        from: 'users.id',
        through: {
          from: 'users_roles.user_id',
          to: 'users_roles.role_id'
        },
        to: 'roles.id'
      }
    },
    farms: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: path.resolve(__dirname, 'farms'),
      join: {
        from: 'users.id',
        through: {
          from: 'farms_users.user_id',
          to: 'farms_users.farm_id'
        },
        to: 'farms.id'
      }
    },
    depots: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: path.resolve(__dirname, 'depots'),
      join: {
        from: 'users.id',
        through: {
          from: 'depots_users.user_id',
          to: 'depots_users.depot_id'
        },
        to: 'depots.id'
      }
    },
    initiatives: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: path.resolve(__dirname, 'initiatives'),
      join: {
        from: 'users.id',
        through: {
          from: 'initiatives_users.user_id',
          to: 'initiatives_users.initiative_id'
        },
        to: 'initiatives.id'
      }
    }
  }
}

export class UserAdmin extends User {
  static joiSchema = schemas.userAdmin
}
