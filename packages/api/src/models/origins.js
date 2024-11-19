import path from 'path'

import { schemas } from './validation'
import BaseModel from './base'

export default class Origin extends BaseModel {
  static tableName = 'origins'

  // eslint-disable-next-line class-methods-use-this
  type() {
    return 'Origin'
  }

  link() {
    return `/origins/${this.id}`
  }

  static joiSchema = schemas.role

  static relationMappings = {
    users: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: path.resolve(__dirname, 'users'),
      join: {
        from: 'origins.id',
        through: {
          from: 'admins_origins.origin_id',
          to: 'admins_origins.user_id'
        },
        to: 'users.id'
      }
    }
  }
}
