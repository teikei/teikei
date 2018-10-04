import cors from 'cors'

export default app => {
  const whitelist = app.get('cors-origins').split(',')
  const corsOptions = {
    origin: (origin, callback) => {
      if (whitelist.indexOf(origin) !== -1 || !origin) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
  }
  app.use(cors(corsOptions))
}
