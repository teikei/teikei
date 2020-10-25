import Arena from 'bull-arena'
import Bull from 'bull'
import userAccountBasicAuth from '../middleware/userAccountBasicAuth'
import {
  REVERSE_GEOCODE_SCANNER_QUEUE,
  REVERSE_GEOCODE_QUEUE,
} from './reverseGeocode'
import { REFRESH_SEARCH_INDEX_QUEUE } from './refreshSearchIndex'
import { SEND_AUDIT_EMAIL } from './sendAuditEmail'

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
        arenaQueue(REFRESH_SEARCH_INDEX_QUEUE),
        arenaQueue(SEND_AUDIT_EMAIL),
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
