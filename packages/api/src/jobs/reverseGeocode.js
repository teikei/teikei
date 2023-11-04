import { logger } from '../logger'

const JOB_NAME = 'reverse geocode'
const SCHEDULE_EVERY_5_MINUTES = '0/5 * * * *'

export default (app) => {
  const scanEntries = async (service) => {
    logger.info(`scanning ${service}`)
    const entities = await app
      .service(`/admin/${service}`)
      .find({ paginate: false })
    logger.info(`found ${entities.length} ${service} records`)
    await Promise.all(
      entities.map(async (entity) => {
        if ((!entity.country && !entity.state) || !entity.postalcode) {
          logger.info(
            service,
            `reverse geocoding ${service} record with id ${entity.id}`,
          )
          const entry = await app
            .service(`/admin/${service}`)
            .get(entity.id, { paginate: false })
          const position = await app.service('reverseGeocoder').create({
            latitude: entry.latitude,
            longitude: entry.longitude,
          })
          await app.service(`/admin/${service}`).patch(
            entity.id,
            {
              country: position.country,
              state: position.state,
              city: position.city,
              postalcode: position.postalCode,
              street: position.street,
              housenumber: position.houseNumber,
            },
            { paginate: false },
          )
        }
      }),
    )
  }

  app.jobs.schedule(2, JOB_NAME, SCHEDULE_EVERY_5_MINUTES, async () => {
    logger.info(`CRON: ${JOB_NAME} - starting`)
    await scanEntries('farms')
    await scanEntries('initiatives')
    await scanEntries('depots')
    logger.info(`CRON: ${JOB_NAME} - done`)
  })
}
