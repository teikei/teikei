import cors from 'cors'

export default app => {
  const corsOptions = {
    origin: app.get('corsOrigins').split(','),
    optionsSuccessStatus: 200
  }
  app.use(cors(corsOptions))
}
