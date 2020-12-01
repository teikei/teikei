import Arena from 'bull-arena'
import Bull from 'bull'
import userAccountBasicAuth from '../middleware/userAccountBasicAuth'
import {
  REVERSE_GEOCODE_SCANNER_QUEUE,
  REVERSE_GEOCODE_QUEUE,
} from './reverseGeocode'

export default (app) => {
  const { url } = app.get('redis')

  const arenaQueue = (info) => ({
    name: info.queueName,
    hostId: 'api',
    url,
  })

  const arena = Arena(
    {
      Bull,
      queues: [
        arenaQueue(REVERSE_GEOCODE_SCANNER_QUEUE),
        arenaQueue(REVERSE_GEOCODE_QUEUE),
      ],
    },
    {
      basePath: '/arena',
      disableListen: true,
    }
  )
  app.use('/arena', userAccountBasicAuth(app))
  app.use('/', arena)
}
