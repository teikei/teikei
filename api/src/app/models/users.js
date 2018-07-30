import { Model } from 'objection'
import schema from '../../../../schemas/entities/user.json'

// not extending from BaseModel and snake case mapping here,
// as this would cause issues with feathers-authentication-management
export default class User extends Model {
  static tableName = 'users'

  static jsonSchema = schema

  static relationMappings = {
    roles: {
      relation: Model.ManyToManyRelation,
      modelClass: `${__dirname}/roles`,
      join: {
        from: 'users.id',
        through: {
          from: 'users_roles.user_id',
          to: 'users_roles.role_id'
        },
        to: 'roles.id'
      }
    }
  }
}
