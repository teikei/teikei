import BaseModel from './base.js'
import EmailCampaignAdmin from './emailCampaigns.js'
import { schemas } from './validation/index.js'

export default class EmailMessageAdmin extends BaseModel {
  static tableName = 'email_messages'

  type() {
    return 'EmailMessage'
  }

  link() {
    return `/email-messages/${this.id}`
  }

  // TODO create schemas for role, product, email campaign, email messages
  static joiSchema = schemas.emailMessageAdmin

  static get relationMappings() {
    return {
      campaign: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: EmailCampaignAdmin,
        join: {
          from: 'email_messages.campaign_id',
          to: 'campaigns.id'
        }
      }
    }
  }
}
