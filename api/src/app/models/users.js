import { BaseModel } from './base'
import schema from '../../../../schemas/entities/user.json'

export default class User extends BaseModel {
  static tableName = 'next_users'

  static jsonSchema = schema

  static relationMappings = {
    roles: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: `${__dirname}/roles`,
      join: {
        from: 'next_users.id',
        through: {
          from: 'users_roles.user_id',
          to: 'users_roles.role_id'
        },
        to: 'next_roles.id'
      }
    }
  }
}
