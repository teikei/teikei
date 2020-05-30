import { schemas } from './validation'
import BaseModel from './base'

export default class Depot extends BaseModel {
  static tableName = 'depots'

  // eslint-disable-next-line class-methods-use-this
  type() {
    return 'Depot'
  }

  link() {
    return `/depots/${this.id}`
  }

  static joiSchema = schemas.depot

  static relationMappings = {
    ownerships: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: `${__dirname}/users`,
      join: {
        from: 'depots.id',
        through: {
          from: 'depots_users.depot_id',
          to: 'depots_users.user_id',
        },
        to: 'users.id',
      },
    },
    farms: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: `${__dirname}/farms`,
      join: {
        from: 'depots.id',
        through: {
          from: 'farms_depots.depot_id',
          to: 'farms_depots.farm_id',
        },
        to: 'farms.id',
      },
    },
  }
}

export class DepotAdmin extends Depot {
  static joiSchema = schemas.depotAdmin
}
