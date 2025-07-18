import path from 'path'

import BaseModel from './base'
import { schemas } from './validation'

export default class Origin extends BaseModel {
  static tableName = 'origins'

  type() {
    return 'Origin'
  }

  link() {
    return `/origins/${this.id}`
  }

  static joiSchema = schemas.origin

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
