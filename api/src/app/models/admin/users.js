import { BaseModel } from '../base'

export default class User extends BaseModel {
  static tableName = 'users'

  type() {
    return 'User'
  }
}
