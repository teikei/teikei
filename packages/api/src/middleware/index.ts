import type { Application } from '@feathersjs/express'
import type { RequestHandler } from 'express'

const includeHeaders = (): RequestHandler => (req, res, next) => {
  req.feathers.headers = req.headers
  next()
}

export default (app: Application) => {
  app.use(includeHeaders())
}
