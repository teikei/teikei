export default (app) => {
  app.jobs.schedule(
    'scan entries for missing country or state',
    '0/5 * * * *',
    async () => {
      const scanEntries = async (service) => {
        app.info(`scanning ${service}`)
        const entities = await app
          .service(`/admin/${service}`)
          .find({ paginate: false })
        app.info(`found ${entities.length} ${service} records`)
        await Promise.all(
          entities.map(async (entity) => {
            if ((!entity.country && !entity.state) || !entity.postalcode) {
              app.info(
                service,
                `reverse geocoding ${service} record with id ${entity.id}`
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
                { paginate: false }
              )
            }
          })
        )
      }
      await scanEntries('farms')
      await scanEntries('initiatives')
      await scanEntries('depots')
    }
  )
}
