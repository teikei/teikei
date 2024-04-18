import { schemas } from "./validation"
import BaseModel from "./base"
import path from "path"

export default class EmailMessageAdmin extends BaseModel {
  static tableName = "email_messages"

  // eslint-disable-next-line class-methods-use-this
  type() {
    return "EmailMessage"
  }

  link() {
    return `/email-messages/${this.id}`
  }

  // TODO create schemas for role, product, email campaign, email messages
  static joiSchema = schemas.emailMessageAdmin

  static relationMappings = {
    campaign: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: path.resolve(__dirname, "emailCampaigns"),
      join: {
        from: "email_messages.campaign_id",
        to: "campaigns.id",
      },
    },
  }
}
