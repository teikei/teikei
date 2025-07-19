import path from 'path'

import BaseModel from './base'
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

  static relationMappings = {
    messages: {
      relation: BaseModel.HasManyRelation,
      modelClass: path.resolve(__dirname, 'emailMessages'),
      join: {
        from: 'campaigns.id',
        to: 'email_messages.campaign_id'
      }
    }
  }
}
