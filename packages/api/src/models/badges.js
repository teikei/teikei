import BaseModel from './base.js'

export default class Goal extends BaseModel {
  static tableName = 'badges'

  type() {
    return 'Badge'
  }

  link() {
    return `/badges/${this.id}`
  }
}
