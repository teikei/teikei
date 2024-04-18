import BaseModel from "./base"

export default class Goal extends BaseModel {
  static tableName = "badges"

  // eslint-disable-next-line class-methods-use-this
  type() {
    return "Badge"
  }

  link() {
    return `/badges/${this.id}`
  }
}
