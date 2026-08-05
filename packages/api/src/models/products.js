import BaseModel from './base.js'
import { schemas } from './validation/index.js'

export default class Product extends BaseModel {
  static tableName = 'products'

  type() {
    return 'Product'
  }

  link() {
    return `/products/${this.id}`
  }

  static joiSchema = schemas.product
}
