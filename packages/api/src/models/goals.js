import BaseModel from './base.js'

export default class Goal extends BaseModel {
  static tableName = 'goals'

  type() {
    return 'Goal'
  }

  link() {
    return `/goals/${this.id}`
  }
}
