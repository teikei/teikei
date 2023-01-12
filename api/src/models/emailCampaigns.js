import { schemas } from './validation'
import BaseModel from './base'
import path from 'path'

export default class EmailCampaign extends BaseModel {
  static tableName = 'email_campaigns'

  // eslint-disable-next-line class-methods-use-this
  type() {
    return 'EmailCampaign'
  }

  link() {
    return `/email-campaigns/${this.id}`
  }

  // TODO create schemas for role, product, campaign
  static joiSchema = schemas.emailCampaign

  static relationMappings = {
    messages: {
      relation: BaseModel.HasManyRelation,
      modelClass: path.resolve(__dirname, 'emailMessages'),
      join: {
        from: 'campaigns.id',
        to: 'email_messages.campaign_id',
      },
    },
  }
}
