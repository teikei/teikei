import { schemas } from "./validation";
import BaseModel from "./base";

export default class Product extends BaseModel {
  static tableName = "products";

  // eslint-disable-next-line class-methods-use-this
  type() {
    return "Product";
  }

  link() {
    return `/products/${this.id}`;
  }

  static joiSchema = schemas.product;
}
