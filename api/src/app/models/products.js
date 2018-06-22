import { BaseModel } from './base'
import schema from '../../../../schemas/entities/product.json'

export default class Product extends BaseModel {
  static tableName = 'products'

  static jsonSchema = schema
}
