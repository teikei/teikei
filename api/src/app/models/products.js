import { BaseModel } from './base'
import schema from '../../../../schemas/entities/product.json'

export default class Product extends BaseModel {
  static tableName = 'next_products'

  static jsonSchema = schema
}
