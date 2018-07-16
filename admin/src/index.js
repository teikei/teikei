import express from 'express'
import expressAdmin from 'express-admin'
import pino from 'express-pino-logger'
import path from 'path'

import config from './config/config.json'
import settings from './config/settings.json'
import custom from './config/custom.json'
import users from './config/users.json'

const configuration = {
  dpath: path.resolve(__dirname, './config/'),
  config,
  settings,
  custom,
  users
  // additionally you can pass your own session middleware to use
  // session: session({...})
}

expressAdmin.init(configuration, (err, admin) => {
  if (err) return console.log(err)

  const app = express()

  app.use('/admin', admin)
  app.use(pino())
  // app.use(express.bodyParser())
  app.get('/', (req, res) => {
    res.send('Hello World')
  })
  return app.listen(3000, () => {
    console.log('My awesome site listening on port 3000')
  })
})
