import BaseModel from './base.js'
import User from './users.js'
import { schemas } from './validation/index.js'

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
