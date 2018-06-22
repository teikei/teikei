import express from '@feathersjs/express'
import path from 'path'

export default app => {
  app.use(
    '/schemas',
    express.static(path.resolve(__dirname, '../../../schemas'))
  )
}
