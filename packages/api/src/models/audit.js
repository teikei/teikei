import BaseModel from './base'

export default class Audit extends BaseModel {
  static tableName = 'audit'

  type() {
    return 'Audit'
  }
}
