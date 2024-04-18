import BaseModel from "./base"

export default class Audit extends BaseModel {
  static tableName = "audit"

  // eslint-disable-next-line class-methods-use-this
  type() {
    return "Audit"
  }
}
