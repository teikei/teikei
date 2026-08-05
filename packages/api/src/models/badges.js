import BaseModel from './base'

export default class Goal extends BaseModel {
  static tableName = 'badges'

  type() {
    return 'Badge'
  }

  link() {
    return `/badges/${this.id}`
  }
}
