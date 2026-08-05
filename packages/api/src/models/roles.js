import BaseModel from './base'
import User from './users'
import { schemas } from './validation'

export default class Role extends BaseModel {
  static tableName = 'roles'

  type() {
    return 'Role'
  }

  link() {
    return `/roles/${this.id}`
  }

  static joiSchema = schemas.role

  static get relationMappings() {
    return {
      users: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'roles.id',
          through: {
            from: 'users_roles.role_id',
            to: 'users_roles.user_id'
          },
          to: 'users.id'
        }
      }
    }
  }
}
