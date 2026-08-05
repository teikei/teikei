import BaseModel from './base.js'
import User from './users.js'
import { schemas } from './validation/index.js'

export default class Origin extends BaseModel {
  static tableName = 'origins'

  type() {
    return 'Origin'
  }

  link() {
    return `/origins/${this.id}`
  }

  static joiSchema = schemas.origin

  static get relationMappings() {
    return {
      users: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: User,
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
}
