import Arena from 'bull-arena'
import userAccountBasicAuth from '../middleware/userAccountBasicAuth'

export default app => {
  const { url } = app.get('redis')

  const arena = Arena(
    {
      queues: [
        {
          name: 'refresh_search_index',
          hostId: 'api',
          url
        }
      ]
    },
    {
      basePath: '/arena',
      disableListen: true
    }
  )
  app.use('/arena', userAccountBasicAuth(app))
  app.use('/', arena)
}
