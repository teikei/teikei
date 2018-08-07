import { BaseModel } from '../base'

export default class Farm extends BaseModel {
  static tableName = 'farms'

  type() {
    return 'Farm'
  }

  static relationMappings = {
    ownerships: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: `${__dirname}/users`,
      join: {
        from: 'farms.id',
        through: {
          from: 'farms_users.farm_id',
          to: 'farms_users.user_id'
        },
        to: 'users.id'
      }
    },
    places: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: `${__dirname}/depots`,
      join: {
        from: 'farms.id',
        through: {
          from: 'farms_depots.farm_id',
          to: 'farms_depots.depot_id'
        },
        to: 'depots.id'
      }
    },
    products: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: `${__dirname}/products`,
      join: {
        from: 'farms.id',
        through: {
          from: 'farms_products.farm_id',
          to: 'farms_products.product_id'
        },
        to: 'products.id'
      }
    }
  }
}

export class FarmsDepots extends BaseModel {
  static tableName = 'farms_depots'

  static jsonSchema = {
    type: 'object',
    properties: {
      farm_id: {
        type: 'integer'
      },
      depot_id: {
        type: 'integer'
      }
    }
  }

  static relationMappings = {
    farm: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: `${__dirname}/farms`,
      join: {
        from: 'farms_depots.farm_id',
        to: 'farms.id'
      }
    },
    depot: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: `${__dirname}/depots`,
      join: {
        from: 'farms_depots.depot_id',
        to: 'depots.id'
      }
    }
  }
}

export class FarmsProducts extends BaseModel {
  static tableName = 'farms_products'

  static jsonSchema = {
    type: 'object',
    properties: {
      farm_id: {
        type: 'integer'
      },
      product_id: {
        type: 'integer'
      }
    }
  }

  static relationMappings = {
    farm: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: `${__dirname}/farms`,
      join: {
        from: 'farms_products.farm_id',
        to: 'farms.id'
      }
    },
    product: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: `${__dirname}/products`,
      join: {
        from: 'farms_products.product_id',
        to: 'products.id'
      }
    }
  }
}

export class FarmsUsers extends BaseModel {
  static tableName = 'farms_users'

  static jsonSchema = {
    type: 'object',
    properties: {
      farm_id: {
        type: 'integer'
      },
      user_id: {
        type: 'integer'
      }
    }
  }

  static relationMappings = {
    farm: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: `${__dirname}/farms`,
      join: {
        from: 'farms_users.farm_id',
        to: 'farms.id'
      }
    },
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: `${__dirname}/users`,
      join: {
        from: 'farms_users.user_id',
        to: 'users.id'
      }
    }
  }
}
