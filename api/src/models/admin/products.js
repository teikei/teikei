import { BaseModel } from '../base'

export default class Product extends BaseModel {
  static tableName = 'products'

  // eslint-disable-next-line class-methods-use-this
  type() {
    return 'Product'
  }
}
