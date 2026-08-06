import BaseModel from './base.js'

export default class Audit extends BaseModel {
  static tableName = 'audit'

  type() {
    return 'Audit'
  }
}
