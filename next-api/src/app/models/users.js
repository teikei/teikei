import { BaseModel } from './base'

export default class User extends BaseModel {
  static tableName = 'next_users'

  static jsonSchema = {
    type: 'object',
    required: ['email', 'name', 'password', 'origin', 'baseurl'],
    properties: {
      id: {
        type: 'integer'
      },
      email: {
        type: 'string',
        maxLength: 100
      },
      name: {
        type: 'string',
        maxLength: 100
      },
      password: {
        type: 'string',
        maxLength: 100
      },
      origin: {
        type: 'string',
        maxLength: 100
      },
      baseurl: {
        type: 'string',
        maxLength: 100
      },
      phone: {
        type: 'string',
        maxLength: 100
      },
      is_verified: {
        type: 'boolean'
      },
      verify_token: {
        type: 'string'
      },
      verify_expires: {
        type: 'date'
      },
      verify_changes: {
        type: 'string'
      },
      reset_toke: {
        type: 'string'
      },
      reset_expires: {
        type: 'date'
      },
      created_at: {
        type: 'date-time'
      },
      updated_at: {
        type: 'date-time'
      }
    }
  }

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
        to: 'roles.id'
      }
    }
  }
}
