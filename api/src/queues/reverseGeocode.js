import Queue from 'bull'

export const REVERSE_GEOCODE_SCANNER_QUEUE = {
  queueName: 'reverse_geocode_scanner',
  jobName: 'Scan entries for missing country or state',
  serviceName: '/jobs/reverseGeocode'
}

export const REVERSE_GEOCODE_QUEUE = {
  queueName: 'reverse_geocode',
  jobName: 'Reverse Geocode Country and State',
  serviceName: '/jobs/reverseGeocode'
}

export default app => {
  const DEFAULT_PARAMS = { query: {}, paginate: {} }

  const geocoderQueue = new Queue(REVERSE_GEOCODE_QUEUE.queueName, {
    redis: app.get('redis').url,
    limiter: {
      max: 1,
      duration: 5000
    }
  })

  geocoderQueue.process(async job => {
    const {
      data: { id, service }
    } = job
    const entry = await app.service(`/admin/${service}`).get(id, DEFAULT_PARAMS)
    if (!entry.country || !entry.state) {
      const position = await app
        .service('reverseGeocoder')
        .create({ latitude: entry.latitude, longitude: entry.longitude })
      await app
        .service(`/admin/${service}`)
        .patch(
          id,
          { country: position.country, state: position.state },
          DEFAULT_PARAMS
        )
    }
    job.progress(100)
  })

  const scannerQueue = new Queue(REVERSE_GEOCODE_SCANNER_QUEUE.queueName, {
    redis: app.get('redis').url
  })

  scannerQueue.process(async job => {
    const scanEntries = async service => {
      app.info(`scanning ${service}`)
      const entities = await app
        .service(`/admin/${service}`)
        .find(DEFAULT_PARAMS)
      app.info(`found ${entities.length} ${service} records`)
      entities.forEach(e => {
        if (!e.country || (!e.state && e.id === 1)) {
          app.info(
            service,
            `adding ${service} record with id ${e.id} to geocoder queue`
          )
          geocoderQueue.add({
            name: REVERSE_GEOCODE_QUEUE.jobName,
            service,
            id: e.id
          })
        }
      })
    }
    app.info('reverse geocoding farms')
    await scanEntries('farms')
    await scanEntries('initiatives')
    await scanEntries('depots')
    job.progress(100)
  })

  scannerQueue.add({ name: REVERSE_GEOCODE_SCANNER_QUEUE.jobName })
}
