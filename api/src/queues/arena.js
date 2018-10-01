import Arena from 'bull-arena'

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
  app.use('/', arena)
}
