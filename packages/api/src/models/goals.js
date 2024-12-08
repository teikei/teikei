import BaseModel from './base'

export default class Goal extends BaseModel {
  static tableName = 'goals'

  type() {
    return 'Goal'
  }

  link() {
    return `/goals/${this.id}`
  }
}
