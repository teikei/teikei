import { Model } from 'objection'

export default class Role extends Model {
  static tableName = 'roles'

  static relationMappings = {
    users: {
      relation: Model.ManyToManyRelation,
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
