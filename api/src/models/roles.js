import schema from '@teikei/schemas'

import { BaseModel } from './base'

export default class Role extends BaseModel {
  static tableName = 'roles'

  static jsonSchema = schema.role

  static relationMappings = {
    users: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: `${__dirname}/users`,
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
