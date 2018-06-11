import { BaseModel } from './base'

export default class User extends BaseModel {
  static tableName = 'users'

  static relationMappings = {
    // places: {
    //   relation: Model.ManyToManyRelation,
    //   modelClass: `${__dirname}/places`,
    //   join: {
    //     from: 'users.id',
    //     through: {
    //       from: 'ownerships.user_id',
    //       to: 'ownerships.place_id',
    //       modelClass: `${__dirname}/ownerships`
    //     },
    //     to: 'places.id'
    //   }
    // },
    roles: {
      relation: BaseModel.ManyToManyRelation,
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
