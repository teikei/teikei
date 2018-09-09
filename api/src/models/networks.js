import { BaseModel } from './base'
import { schemas } from './validation'

export default class Network extends BaseModel {
  static tableName = 'networks'

  // eslint-disable-next-line class-methods-use-this
  type() {
    return 'Network'
  }

  link() {
    return `/networks/${this.id}`
  }

  static jsonSchema = schemas.network

  static relationMappings = {
    depots: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: `${__dirname}/depots`,
      join: {
        from: 'networks.id',
        through: {
          from: 'depots_networks.network_id',
          to: 'depots_networks.depot_id'
        },
        to: 'depots.id'
      }
    },
    farms: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: `${__dirname}/farms`,
      join: {
        from: 'networks.id',
        through: {
          from: 'farms_networks.network_id',
          to: 'farms_networks.farm_id'
        },
        to: 'farms.id'
      }
    }
  }
}
