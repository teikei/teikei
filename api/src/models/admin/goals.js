import { BaseModel } from '../base'

export default class Goal extends BaseModel {
  static tableName = 'goals'

  // eslint-disable-next-line class-methods-use-this
  type() {
    return 'Goal'
  }
}
