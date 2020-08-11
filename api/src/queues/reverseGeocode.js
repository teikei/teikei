import Queue from 'bull'

export const REVERSE_GEOCODE_SCANNER_QUEUE = {
  queueName: 'reverse_geocode_scanner',
  jobName: 'Scan entries for missing country or state',
  serviceName: '/jobs/reverseGeocode',
}

export const REVERSE_GEOCODE_QUEUE = {
  queueName: 'reverse_geocode',
  jobName: 'Reverse Geocode Country and State',
  serviceName: '/jobs/reverseGeocode',
}

export default (app) => {
  const geocoderQueue = new Queue(REVERSE_GEOCODE_QUEUE.queueName, {
    redis: app.get('redis').url,
    limiter: {
      max: 1,
      duration: 5000,
    },
  })

  geocoderQueue.process(async (job) => {
    const {
      data: { id, service },
    } = job
    job.log(`reverse geocoding ${service}`)
    const entry = await app
      .service(`/admin/${service}`)
      .get(id, { paginate: false })
    const position = await app
      .service('reverseGeocoder')
      .create({ latitude: entry.latitude, longitude: entry.longitude })
    await app.service(`/admin/${service}`).patch(
      id,
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
    job.progress(100)
  })

  const scannerQueue = new Queue(REVERSE_GEOCODE_SCANNER_QUEUE.queueName, {
    redis: app.get('redis').url,
  })

  scannerQueue.process(async (job) => {
    const scanEntries = async (service) => {
      job.log(`scanning ${service}`)
      const entities = await app
        .service(`/admin/${service}`)
        .find({ paginate: false })
      job.log(`found ${entities.length} ${service} records`)
      entities.forEach((e) => {
        if ((!e.country && !e.state) || !e.postalcode) {
          job.log(
            service,
            `adding ${service} record with id ${e.id} to geocoder queue`
          )
          geocoderQueue.add({
            name: REVERSE_GEOCODE_QUEUE.jobName,
            service,
            id: e.id,
          })
        }
      })
    }
    await scanEntries('farms')
    await scanEntries('initiatives')
    await scanEntries('depots')
    job.progress(100)
  })

  scannerQueue.add({ name: REVERSE_GEOCODE_SCANNER_QUEUE.jobName })
  // TODO this can be removed as soon as we store state/country on entry creation
  scannerQueue.add(
    { name: REVERSE_GEOCODE_SCANNER_QUEUE.jobName },
    { repeat: { cron: '0/5 * * * *' } }
  )
}
