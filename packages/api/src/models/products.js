import BaseModel from './base'
import { schemas } from './validation'

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
