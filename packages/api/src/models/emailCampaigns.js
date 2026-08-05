import BaseModel from './base'
import EmailMessageAdmin from './emailMessages'
import { schemas } from './validation'

export default class EmailCampaignAdmin extends BaseModel {
  static tableName = 'email_campaigns'

  type() {
    return 'EmailCampaign'
  }

  link() {
    return `/email-campaigns/${this.id}`
  }

  // TODO create schemas for role, product, email campaign, email messages
  static joiSchema = schemas.emailCampaignAdmin

  static get relationMappings() {
    return {
      messages: {
        relation: BaseModel.HasManyRelation,
        modelClass: EmailMessageAdmin,
        join: {
          from: 'campaigns.id',
          to: 'email_messages.campaign_id'
        }
      }
    }
  }
}
