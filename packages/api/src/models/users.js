import BaseModel from './base'
import Depot from './depots'
import Farm from './farms'
import Initiative from './initiatives'
import Origin from './origins'
import Role from './roles'
import { schemas } from './validation'

// Secrets that must never appear in serialized user output. These are still
// readable as instance properties (bcrypt comparison, email token links use
// direct property access, not JSON), but are stripped from any toJSON/response
// so they cannot leak through eager-loaded relations or API payloads.
const PROTECTED_USER_FIELDS = [
  'password',
  'verifyToken',
  'verifyShortToken',
  'verifyExpires',
  'verifyChanges',
  'resetToken',
  'resetShortToken',
  'resetExpires'
]

export default class User extends BaseModel {
  static tableName = 'users'

  type() {
    return 'User'
  }

  $formatJson(json) {
    const formatted = super.$formatJson(json)
    PROTECTED_USER_FIELDS.forEach((field) => delete formatted[field])
    return formatted
  }

  link() {
    return `/users/${this.id}`
  }

  static joiSchema = schemas.user

  static get relationMappings() {
    return {
      roles: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Role,
        join: {
          from: 'users.id',
          through: {
            from: 'users_roles.user_id',
            to: 'users_roles.role_id'
          },
          to: 'roles.id'
        }
      },
      adminOrigins: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Origin,
        join: {
          from: 'users.id',
          through: {
            from: 'admins_origins.user_id',
            to: 'admins_origins.origin_id'
          },
          to: 'origins.id'
        }
      },
      farms: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Farm,
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
        modelClass: Depot,
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
        modelClass: Initiative,
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
}

export class UserAdmin extends User {
  static joiSchema = schemas.userAdmin
}
