import { BaseModel } from '../base'

export default class Depot extends BaseModel {
  static tableName = 'depots'

  type() {
    return 'Depot'
  }
}
