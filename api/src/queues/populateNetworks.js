import { disallow } from 'feathers-hooks-common'
import Queue from 'bull'
import _ from 'lodash'

import filterAllowedFields from '../hooks/filterAllowedFields'
import Network from '../models/networks'
import Initiative from '../models/initiatives'
import Farm from '../models/farms'
import Depot from '../models/depots'

// TODO there's orphaned depots?
// DB Version can't get this to work...
//   async find() {
//     // create
//     app.info('refreshing networks')
//
//     await Network.query().truncate()
//     await Network.raw('TRUNCATE TABLE farms_networks')
//     await Network.raw('TRUNCATE TABLE depots_networks')
//
//     const depots = await Depot.query()
//       .select('id')
//
//     const depotIds = depots.map(depot => depot.id)
//
//     depotIds
//       .map(depotId => () =>
//         transaction(Depot.knex(), async trx => {
//           const d = (await Depot.query(trx)
//             .eager('[farms.[network]]')
//             .modifyEager('farms', builder => {
//               builder.select('farms.id', 'farms.name')
//             })
//             .where('id', depotId))[0]
//
//           app.info('processing depot ', d.id)
//
//           const { farms } = d
//           const farmIds = farms.map(f => f.id)
//           if (farmIds.length === 0) {
//             app.info('error: found orphaned depot ', d.id, d.name)
//             return
//           }
//           app.info('belongs to farms ', farmIds)
//
//           const networks = farms.map(f => f.network).filter(f => !!f)
//           app.info('networks', networks)
//
//           if (networks && networks.length > 1) {
//             app.info('error: depot is part of multiple networks ', networks)
//             return
//           }
//           if (networks.length === 1) {
//             app.info(
//               'found network ',
//               networks[0],
//               'for depot ',
//               d.id,
//               d.name
//             )
//             app.info('relating depot ', d.id)
//             await d.$relatedQuery('network', trx).relate(networks[0])
//           } else {
//             app.info('no network found, creating new network')
//             const network = await Network.query(trx).insert({
//               name: farms[0].name
//             })
//             app.info('created network ', network.id, network.name)
//
//             await Promise.all(
//               farms.map(async f => {
//                 app.info('relating farm ', f.id)
//                 return f.$relatedQuery('network', trx).relate(network.id)
//               })
//             )
//
//             app.info('relating depot ', d.id)
//             await d.$relatedQuery('network', trx).relate(network.id)
//           }
//         })
//       )
//       .reduce((p, fn) => p.then(fn()), Promise.resolve())
//   }
// }

export default app => {
  const DEFAULT_JOB_NAME = 'Populate Networks'

  const queue = new Queue('populate_networks')

  queue.process(async job => {
    app.info('refreshing networks')

    await Network.query().truncate()
    await Network.raw('TRUNCATE TABLE networks')
    await Network.raw('TRUNCATE TABLE farms_networks')
    await Network.raw('TRUNCATE TABLE depots_networks')
    await Network.raw('TRUNCATE TABLE initiatives_networks')

    const depots = await Depot.query()
      .select('id')
      .eager('[farms]')
      .modifyEager('farms', builder => {
        builder.select('farms.id', 'farms.name')
      })

    // {depot: [farms], depot: [farms] }
    const depotsFarms = {}
    depots
      .map(d => ({
        depot: d.id,
        farms: d.farms.map(f => f.id)
      }))
      .forEach(({ depot, farms }) => {
        depotsFarms[depot] = farms
      })
    app.info('farms', depotsFarms)

    let networksId = 1

    // data to insert into tables
    const networksRelation = []
    const farmsNetworksRelation = {}
    const depotsNetworksRelation = {}

    // find or create a network based on the farms the depot is connected to
    _.keys(depotsFarms).forEach(depot => {
      const farms = depotsFarms[depot]
      if (farms.length === 0) {
        // no farms found
        app.info('error: found orphaned depot ', depot)
        return
      }
      // networks of farms of depot
      const networks = _.uniq(
        _.compact(farms.map(farm => farmsNetworksRelation[farm]))
      )
      app.info('networks of depot ', depot, networks)
      if (networks && networks.length > 1) {
        app.info('error: depot is part of multiple networks ', networks)
      }
      if (networks.length === 1) {
        // existing network
        const network = networks[0]
        app.info('found network ', network, 'for depot ', depot)
        depotsNetworksRelation[depot] = network
      } else {
        // new network
        app.info('no network found, creating new network', networksId)
        // set network 'name' to id of first farm
        // eslint-disable-next-line prefer-destructuring
        networksRelation[networksId] = farms[0]
        farms.forEach(farm => {
          farmsNetworksRelation[farm] = networksId
        })
        depotsNetworksRelation[depot] = networksId
        networksId += 1
      }
    })

    // resolve names of networks (set to name of first farm)
    await Promise.all(
      _.range(1, networksRelation.length).map(async k => {
        const farm = await Farm.query()
          .where('id', k)
          .select('name')
        if (farm.length !== 1) {
          return
        }

        networksRelation[k] = farm[0].name
      })
    )

    // create a network for each initiative
    const initiatives = await Initiative.query()
    const iniativeNetworksRelation = {}
    initiatives.forEach(i => {
      networksRelation[networksId] = i.name
      iniativeNetworksRelation[i.id] = networksId
      networksId += 1
    })

    app.info('creating ', networksRelation.length, ' networks')

    // write the data to the database
    await Network.query().insert(
      _.compact(networksRelation).map(n => ({ name: n }))
    )
    await Network.knex().batchInsert(
      'farms_networks',
      _.keys(farmsNetworksRelation).map(k => ({
        farm_id: k,
        network_id: farmsNetworksRelation[k]
      }))
    )
    await Network.knex().batchInsert(
      'depots_networks',
      _.keys(depotsNetworksRelation).map(k => ({
        depot_id: k,
        network_id: depotsNetworksRelation[k]
      }))
    )

    await Network.knex().batchInsert(
      'initiatives_networks',
      _.keys(iniativeNetworksRelation).map(k => ({
        initiative_id: k,
        network_id: iniativeNetworksRelation[k]
      }))
    )
    job.progress(100)
  })

  const service = {
    create: (data, params) =>
      queue.add({ ...data, name: data.name || DEFAULT_JOB_NAME }, params)
  }

  app.use('/jobs/populateNetworks', service)

  app
    .service('jobs/populateNetworks')
    .hooks({
      before: {
        all: [disallow('external')],
        create: []
      },
      after: {
        all: [],
        create: []
      },
      error: {
        all: [],
        create: []
      }
    })
    .hooks({
      after: {
        all: [filterAllowedFields]
      }
    })

  app.service('jobs/populateNetworks').create({})
  // TODO refreshing every 5 minutes. maybe refresh immediately on change?
  app
    .service('jobs/populateNetworks')
    .create({}, { repeat: { cron: '0/5 * * * *' } })
}
