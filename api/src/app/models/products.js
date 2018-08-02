import schema from '@teikei/schemas'

import { BaseModel } from './base'

export default class Product extends BaseModel {
  static tableName = 'products'

  static jsonSchema = schema.product
}
