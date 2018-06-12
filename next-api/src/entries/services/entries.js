import Depot from '../../app/models/depots'
import Farm from '../../app/models/farms'
import Initiative from '../../app/models/initiatives'
import { featureCollection } from '../../app/util/jsonUtils'

const columns = ['id', 'name', 'city', 'latitude', 'longitude']

export default app => {
  const service = {
    // TODO use unionAll
    // async find() {
    //   return Farm.query()
    //     .select(columns)
    //     .unionAll(
    //       Depot.query()
    //         .select(columns)
    //         .unionAll(Initiative.query().select(columns))
    //     )
    // }
    async find() {
      const farms = await Farm.query().select(columns)
      const depots = await Depot.query().select(columns)
      const initiatives = await Initiative.query().select(columns)
      return featureCollection(farms.concat(depots).concat(initiatives))
    }
  }

  app.use('/entries', service)
  app.service('entries').hooks({})
}
