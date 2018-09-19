import Arena from 'bull-arena'

export default app => {
  const redis = app.get('redis')

  const arena = Arena(
    {
      queues: [
        {
          name: 'refresh_search_index',
          hostId: 'api',
          redis
        }
      ]
    },
    {
      basePath: '/arena',
      disableListen: true
    }
  )
  app.use('/', arena)
}
